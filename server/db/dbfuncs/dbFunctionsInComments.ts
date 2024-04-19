
/* 
CREATE OR REPLACE FUNCTION fetch_avg_value_for_col_name(fase_array text[], queried_year int, queried_col_name text) RETURNS json AS $$
DECLARE
	avg_value json;
	value int;
	fase_array ALIAS FOR $1;
	queried_year ALIAS FOR $2;
	col_name ALIAS FOR $3;
	json_description_key text := 'description';
	json_avg_value_key text := 'average_value';
	json_median_value_key text := 'median_value';
	json_max_value_key text := 'max_value';
	json_min_value_key text := 'min_value';
	json_name text := substring(col_name FROM 6);
BEGIN
	EXECUTE format ('
		WITH company_data AS (
	                SELECT
	                        cl.code_description AS description,
							od.%I as value,
	                        od.rapportår
	                FROM
	                    økonomisk_data od
	                JOIN
	                    lokal_årlig_bedrift_fase_rapport lbf ON od.bedrift_id = lbf.bedrift_id AND od.rapportår = lbf.rapportår
	                JOIN
	                    code_lookup cl ON cl.economic_code = UPPER(%L)
	                WHERE
	                    od.rapportår = %s
	                AND lbf.fase = ANY(%L)
	                GROUP BY
	                    od.rapportår, cl.code_description, od.%I
	                    ), aggregated_data AS (
	                    SELECT
						json_build_object(
							%L,
	                        json_build_object(
	                            %L, description,
	                            %L, AVG(value),
	                        	%L, percentile_cont(0.5) WITHIN GROUP (ORDER BY value),
	                            %L, MAX(value),
	                            %L, MIN(value)
	                        ))
	                    FROM
	                        company_data
	                    WHERE 
	                        value IS NOT NULL
	                    GROUP BY
	                        description
	                    ORDER BY
	                        description
	                    )
	                SELECT 
						*
					FROM
	                    aggregated_data;
	', col_name, col_name, queried_year, fase_array, col_name, json_name, json_description_key, json_avg_value_key, json_median_value_key, json_max_value_key, json_min_value_key)
INTO
	avg_value;
RETURN
	avg_value;
END;
$$ language plpgsql
 */

/*  SELECT * FROM fetch_avg_value_for_col_name('{Alumni}', 2020, 'code_eka') */

/* CREATE OR REPLACE FUNCTION	create_yearly_object(fase_array text[], queried_year int) RETURNS json AS $$

DECLARE
	fase_array ALIAS FOR $1;
	queried_year ALIAS FOR $2;
	yearly_data json;
	col_name_array text[];
BEGIN
	SELECT fetch_col_name_array() INTO col_name_array;
	SELECT json_agg(data) INTO yearly_data
	FROM (
		SELECT fetch_avg_value_for_col_name(fase_array, queried_year, curr_name) AS data
		FROM unnest(col_name_array) AS curr_name
	)
	WHERE data IS NOT NULL;
	RETURN 
	json_build_object(
		'year', queried_year,
		'fase', array_to_string(fase_array, ', '),
		'averageValues', yearly_data
	);
END;
$$ language plpgsql
SELECT * FROM create_yearly_object('{Alumni}', 2020)

CREATE OR REPLACE FUNCTION create_avg_data_over_set_years(fase_array text[], start_year int, end_year int) RETURNS json AS $$
DECLARE
	fase_array ALIAS FOR $1;
	start_year ALIAS FOR $2;
	end_year ALIAS FOR $3;
	data json;
BEGIN 
	SELECT json_agg(yearly_data) INTO data
	FROM (
		SELECT create_yearly_object(fase_array, generate_series) AS yearly_data
		FROM generate_series(start_year, end_year)
	);
RETURN data;
END;
$$ language plpgsql


SELECT * FROM create_avg_data_over_set_years('{Alumni}', 2020, 2023)
*/

/* 

CREATE OR REPLACE FUNCTION fetch_data_with_fase(fase_array text[], start_year int, end_year int) RETURNS TABLE (
	målbedrift text,
	bedrift_id int,
	bransje text,
	orgnummer int,
	data json
) AS $$
BEGIN
	RETURN QUERY(
	WITH company_data AS (
            SELECT
                bedrift_info.målbedrift,
                bedrift_info.bedrift_id,
                bedrift_info.bransje,
                bedrift_info.orgnummer,
                lokal_årlig_bedrift_fase_rapport.fase,	
                økonomisk_data.rapportår,
                (
                SELECT jsonb_object_agg(split_part(økonomisk_data_kv.key, '_', 2), jsonb_build_object(
                    'description', code_lookup.code_description,
                    'value', økonomisk_data_kv.ed_value
                ))
                    FROM (
                        SELECT key, value::numeric AS ed_value
                        FROM jsonb_each_text(to_jsonb(økonomisk_data.*) - 'bedrift_id' - 'rapportår' )
                        WHERE value IS NOT NULL
                    ) AS økonomisk_data_kv
                    JOIN code_lookup ON code_lookup.economic_code = UPPER(økonomisk_data_kv.key)
                ) AS queried_data
            FROM bedrift_info
            INNER JOIN økonomisk_data ON økonomisk_data.bedrift_id = bedrift_info.bedrift_id
            INNER JOIN lokal_årlig_bedrift_fase_rapport ON lokal_årlig_bedrift_fase_rapport.bedrift_id = bedrift_info.bedrift_id
            AND lokal_årlig_bedrift_fase_rapport.rapportår = økonomisk_data.rapportår
            WHERE 
                lokal_årlig_bedrift_fase_rapport.fase = any(fase_array)
            AND økonomisk_data.rapportår BETWEEN start_year AND end_year
            ORDER BY bedrift_info.målbedrift, økonomisk_data.rapportår
        	), 
		aggregated_data AS (
            SELECT 
                c.målbedrift,
                c.bedrift_id,
                c.bransje,
                c.orgnummer,
                json_agg(
                    json_build_object(
                        'rapportår', c.rapportår,
                        'fase', c.fase,
                        'queried_data', c.queried_data
                    )
                ) AS data
            FROM
                company_data c
            GROUP BY
                c.målbedrift, c.bedrift_id, c.bransje, c.orgnummer
            ORDER BY
                c.målbedrift
        )
        SELECT 
            a.målbedrift,
			a.bedrift_id,
			a.bransje,
			a.orgnummer,
			a.data
        FROM 
			aggregated_data a
	);
END;
$$ language plpgsql
SELECT * FROM fetch_data_with_fase('{Alumni}', 2020, 2023)
*/



/* 
CREATE OR REPLACE FUNCTION fetch_data_based_on_name_snippet(name_snippet text, start_year int, end_year int) RETURNS TABLE(
	målbedrift text,
	bedrift_id int,
	bransje text,
	orgnummer int,
	data json
) AS $$
BEGIN
	RETURN QUERY(
		WITH company_data AS (
                SELECT 
                    bedrift_info.målbedrift,
                    bedrift_info.bedrift_id,
                    bedrift_info.bransje,
                    bedrift_info.orgnummer,
                    lokal_årlig_bedrift_fase_rapport.fase,
                    økonomisk_data.rapportår,
                    (
                    SELECT jsonb_object_agg(split_part(økonomisk_data_kv.key, '_', 2), jsonb_build_object(
                        'description', code_lookup.code_description,
                        'value', økonomisk_data_kv.ed_value
                    ))
                        FROM (
                            SELECT key, value::numeric AS ed_value
                            FROM jsonb_each_text(to_jsonb(økonomisk_data.*) - 'bedrift_id' - 'rapportår' )
                            WHERE value IS NOT NULL
                        ) AS økonomisk_data_kv
                        JOIN code_lookup ON code_lookup.economic_code = UPPER(økonomisk_data_kv.key)
                    ) AS queried_data
                FROM bedrift_info
                INNER JOIN økonomisk_data ON økonomisk_data.bedrift_id = bedrift_info.bedrift_id
                INNER JOIN lokal_årlig_bedrift_fase_rapport ON lokal_årlig_bedrift_fase_rapport.bedrift_id = bedrift_info.bedrift_id
                WHERE bedrift_info.målbedrift ILIKE '%' || name_snippet || '%'
                AND lokal_årlig_bedrift_fase_rapport.rapportår = økonomisk_data.rapportår
                AND økonomisk_data.rapportår BETWEEN start_year AND end_year
                ORDER BY bedrift_info.målbedrift, økonomisk_data.rapportår
            ), aggregated_data AS (
                SELECT
                    c.målbedrift,
                    c.bedrift_id,
                    c.bransje,
                    c.orgnummer,
                    json_agg(
                        json_build_object(
                            'rapportår', c.rapportår,
                            'fase', c.fase,
                            'queried_data', c.queried_data
                        )
                    ) AS data
                FROM
                    company_data c
                GROUP BY
                    c.målbedrift, c.bedrift_id, c.bransje, c.orgnummer
                ORDER BY
                    c.målbedrift
            )
            SELECT 
            	a.målbedrift,
				a.bedrift_id,
				a.bransje,
				a.orgnummer,
				a.data
            FROM
                aggregated_data a
			);
END;
$$ language plpgsql

SELECT * FROM fetch_data_based_on_name_snippet('nord', 2020, 2023)


CREATE OR REPLACE FUNCTION fetch_data_by_org_nr(org_nr int, start_year int, end_year int) RETURNS TABLE(
	målbedrift text,
	bedrift_id int,
	bransje text,
	orgnummer int,
	data json
) AS $$
BEGIN
	RETURN QUERY(
		WITH company_data AS (
            SELECT
                bedrift_info.målbedrift,
                bedrift_info.bedrift_id,
                bedrift_info.bransje,
                bedrift_info.orgnummer,
                lokal_årlig_bedrift_fase_rapport.fase,
                økonomisk_data.rapportår,
                (
                SELECT jsonb_object_agg(split_part(økonomisk_data_kv.key, '_', 2), jsonb_build_object(
                    'description', code_lookup.code_description,
                    'value', økonomisk_data_kv.ed_value
                ))
                    FROM (
                        SELECT key, value::numeric AS ed_value
                        FROM jsonb_each_text(to_jsonb(økonomisk_data.*) - 'bedrift_id' - 'rapportår' )
                        WHERE value IS NOT NULL
                    ) AS økonomisk_data_kv
                    JOIN code_lookup ON code_lookup.economic_code = UPPER(økonomisk_data_kv.key)
                ) AS queried_data
            FROM bedrift_info
            INNER JOIN økonomisk_data ON økonomisk_data.bedrift_id = bedrift_info.bedrift_id
            INNER JOIN lokal_årlig_bedrift_fase_rapport ON lokal_årlig_bedrift_fase_rapport.bedrift_id = bedrift_info.bedrift_id
            WHERE bedrift_info.orgnummer = org_nr
            AND lokal_årlig_bedrift_fase_rapport.rapportår = økonomisk_data.rapportår
            AND økonomisk_data.rapportår BETWEEN start_year AND end_year
            ORDER BY bedrift_info.målbedrift, økonomisk_data.rapportår
        ), aggregated_data AS (
                SELECT
                    c.målbedrift,
                    c.bedrift_id,
                    c.bransje,
                    c.orgnummer,
                    json_agg(
                        json_build_object(
                            'rapportår', c.rapportår,
                            'fase', c.fase,
                            'queried_data', c.queried_data
                        )
                    ) AS data
                FROM
                    company_data c
                GROUP BY
                    c.målbedrift, c.bedrift_id, c.bransje, c.orgnummer
                ORDER BY
                    c.målbedrift
            )
            SELECT 
                *
            FROM
                aggregated_data
	);
END;
$$ language plpgsql
*/
