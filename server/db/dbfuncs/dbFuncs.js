import { db } from "../dbConfig/dbConfig.js";
import { economickeys } from "../mockData/responseConstructor.js";
/**
 * Spesifikk søkefunksjon basert på fase.
 *
 * Henter ut økonomisk data. Returnerer som queryReturnType.
 *
 * Økonomisk data = {
 *  "beskrivelse" : number
 * }
 *
 * )
 * @param tagArray Et array av tags.
 * @returns Array av data av typen dataType
 */
export const searchByfaseSpesific = async (tagArray, startYear = 0, endYear = new Date().getFullYear()) => {
    try {
        console.log(tagArray);
        const data = await db.query(`
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
                lokal_årlig_bedrift_fase_rapport.fase = any($1)
            AND økonomisk_data.rapportår BETWEEN ${startYear} AND ${endYear}
            ORDER BY bedrift_info.målbedrift, økonomisk_data.rapportår
        ), aggregated_data AS (
            SELECT 
                målbedrift,
                bedrift_id,
                bransje,
                orgnummer,
                json_agg(
                    json_build_object(
                        'rapportår', rapportår,
                        'fase', fase,
                        'queried_data', queried_data
                    )
                ) AS data
            FROM
                company_data
            GROUP BY
                målbedrift, bedrift_id, bransje, orgnummer
            ORDER BY
                målbedrift
        )
        SELECT 
            *
        FROM aggregated_data
        `, [tagArray]);
        if (data.rowCount != null && data.rowCount > 0)
            return { success: true, error: null, result: data.rows };
        else
            return { success: true, error: null, result: `No Company Found Containing The Tags: ${tagArray.join(", ")}` };
    }
    catch (error) {
        return { success: false, error: error, result: null };
    }
};
export const searchByName = async (companyNameSnippet, startYear = 0, endYear = new Date().getFullYear()) => {
    try {
        const data = await db.query(`
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
                WHERE bedrift_info.målbedrift ILIKE '%' || $1 || '%'
                AND lokal_årlig_bedrift_fase_rapport.rapportår = økonomisk_data.rapportår
                AND økonomisk_data.rapportår BETWEEN ${startYear} AND ${endYear}
                ORDER BY bedrift_info.målbedrift, økonomisk_data.rapportår
            ), aggregated_data AS (
                SELECT
                    målbedrift,
                    bedrift_id,
                    bransje,
                    orgnummer,
                    json_agg(
                        json_build_object(
                            'rapportår', rapportår,
                            'fase', fase,
                            'queried_data', queried_data
                        )
                    ) AS data
                FROM
                    company_data
                GROUP BY
                    målbedrift, bedrift_id, bransje, orgnummer
                ORDER BY
                    målbedrift
            )
            SELECT 
                *
            FROM
                aggregated_data
            `, [companyNameSnippet]);
        if (data.rowCount != null && data.rowCount > 0)
            return { success: true, error: null, result: data.rows };
        else
            return { success: true, error: null, result: `No Company Found With Name Containing ${companyNameSnippet}` };
    }
    catch (error) {
        return { success: false, error: error, result: null };
    }
};
export const searchByOrgNr = async (companyOrgNr, startYear = 0, endYear = new Date().getFullYear()) => {
    try {
        const data = await db.query(`
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
            WHERE bedrift_info.orgnummer = $1
            AND lokal_årlig_bedrift_fase_rapport.rapportår = økonomisk_data.rapportår
            AND økonomisk_data.rapportår BETWEEN ${startYear} AND ${endYear}
            ORDER BY bedrift_info.målbedrift, økonomisk_data.rapportår
        ), aggregated_data AS (
                SELECT
                    målbedrift,
                    bedrift_id,
                    bransje,
                    orgnummer,
                    json_agg(
                        json_build_object(
                            'rapportår', rapportår,
                            'fase', fase,
                            'queried_data', queried_data
                        )
                    ) AS data
                FROM
                    company_data
                GROUP BY
                    målbedrift, bedrift_id, bransje, orgnummer
                ORDER BY
                    målbedrift
            )
            SELECT 
                *
            FROM
                aggregated_data
        `, [companyOrgNr]);
        if (data.rowCount !== null && data.rowCount > 0) {
            return { success: true, error: null, result: data.rows };
        }
        else
            return { success: true, error: null, result: `No Company Found With The Org Nr: ${companyOrgNr}` };
    }
    catch (error) {
        return { success: false, error: error, result: null };
    }
};
/**
 * funksjon for å hente tagArray for gjeldene bedrift_id
 * @param companyId
 * @returns array of tags.
 */
export const getTagsFromCompanyId = async (companyId) => {
    try {
        const data = await db.query(`
        SELECT fase
        FROM lokal_årlig_bedrift_fase_rapport
        WHERE bedrift_id = $1
        `, [companyId]);
        return { success: true, error: null, result: data.rows };
    }
    catch (error) {
        return { success: false, error: error, result: null };
    }
};
/**
 * searchbytag for comparison data.
 * Lager company_data som orginal fase søk, så aggrigerer data i Aggregate_data
 * Som leverer AVG og MEDIAN values for hver bit for hvert år.
 *
 * )
 * @param tagArray Et array av tags.
 * @returns Array av data av typen dataType
 */
export const searchByComparisonfaseSpesific = async (tagArray, startYear = 2013, endYear = new Date().getFullYear(), keys = economickeys) => {
    try {
        const columns = await db.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'økonomisk_data'
        AND column_name ILIKE 'code_%'
        `);
        const columnNamesArray = columns.rows.map(name => {
            return name.column_name;
        });
        const averageValuesArray = [];
        for (let i = startYear; i <= endYear; i++) {
            const yearlyObject = {
                year: i,
                fase: tagArray.join(", "),
                averageValues: []
            };
            for (let name of columnNamesArray) {
                const avgValue = await db.query(`
                    WITH company_data AS (
                        SELECT
                        cl.code_description AS description,
                        od.${name} AS value,
                        od.rapportår
                    FROM
                        økonomisk_data od
                    JOIN
                        lokal_årlig_bedrift_fase_rapport lbf ON od.bedrift_id = lbf.bedrift_id AND od.rapportår = lbf.rapportår
                    JOIN
                        code_lookup cl ON cl.economic_code = UPPER('${name}')
                    WHERE
                        od.rapportår = ${i}
                    AND lbf.fase = ANY($1) 
                    GROUP BY
                        od.rapportår, cl.code_description, od.${name}
                    ), aggregated_data AS (
                        SELECT
                            json_build_object(
                                'description', description,
                                'average_value', AVG(value),
                                'median_value', percentile_cont(0.5) WITHIN GROUP (ORDER BY value),
                                'max_value', MAX(value),
                                'min_value', MIN(value)
                            ) AS ${name.split("_")[1]}
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
                        aggregated_data
                `, [tagArray]);
                if (avgValue.rowCount != null && avgValue.rowCount > 0) {
                    yearlyObject.averageValues.push(avgValue.rows[0]);
                }
            }
            averageValuesArray.push(yearlyObject);
        }
        console.log(averageValuesArray);
        return { success: true, result: averageValuesArray };
    }
    catch (error) {
        return { success: false, error: error, result: null };
    }
};
