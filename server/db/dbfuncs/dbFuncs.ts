import { QueryResult } from "pg";
import { db } from "../dbConfig/dbConfig.js";
//brukes bare for insert av mockData til local database
/* import mockData from "../mockData/mockData.json" assert {type: "json"}
import { economicCodes } from "../mockData/responseConstructor.js";
import { CompanyType } from "./chatgptMockDataGeneration.js"; */
import { cleanedData } from "../excelReader/excelReader.js";

/* RESTRUKTURER TIL Å VÆRE TILPASSET INKUBATORSTATUS! */


/* company_names.company_id, economic_data.queried_year, economic_data.operating_income, economic_data.operating_profit, economic_data.result_before_taxes, economic_data.annual_result, economic_data.total_assets, */

type queryReturnType = {
            company_name: string,
            company_id: number,
            company_field: string,
            data: [
                    {
                    queried_year: number,
                    queried_data: {
                            [key: string]: number
                        }
                }
            ]

}

type tagnameQueryType = {
    tagname: string
}


/* 
Current Schema

CREATE TABLE IF NOT EXISTS bedrift_info (
        bedrift_id SERIAL PRIMARY KEY,
        orgnummer INTEGER UNIQUE NOT NULL,
        målbedrift TEXT NOT NULL,
        bransje TEXT,
        beskrivelse TEXT,
        idekilde TEXT,
        )`
 */

const insertInitialCleanedData = async() =>{
    const dataInsertionArray: QueryResult<any>[] = []
    try{
        for (let company of cleanedData){
            console.log(`inserting companydata for ${company.målbedrift}`)
            const insertIntoCompanyName = await db.query(`
            INSERT INTO company_names (orgnummer, målbedrift${company.bransje != undefined ? ", bransje" : ""}${company.beskrivelse != undefined ? ", beskrivelse" : ""}${company.idekilde != undefined ? ", idekilde" : ""})
            VALUES (${company.orgnummer}, $1${company.bransje != undefined ? `, '${company.bransje}'` : ""}${company.beskrivelse != undefined ? `, '${company.beskrivelse}'` : ""}${company.idekilde != undefined ? `, '${company.idekilde}'` : ""})
            RETURNING company_id
            `, [company.målbedrift])
            dataInsertionArray.push(insertIntoCompanyName)
            const companyId = insertIntoCompanyName.rows[0].company_id as number
            for (let year of company.data){
                console.log(`Inserting data for year ${year.rapportår}`)
                const insertIntoCompanyStatus = await db.query(`
                INSERT INTO company_status_relationship (company_id, queried_year, status)
                VALUES ($1, $2, '${year.fase}')
                `, [companyId, year.rapportår])
                dataInsertionArray.push(insertIntoCompanyStatus)
            }
        }
        return {success: true, dataInsertionArray}
    } catch (error){
        return {success: false, error}
    }
}
/* const insertComparisonData = async(dataArray: dataType[]) =>{
    const dbQueryArray = []
    try{
        const userInsertion = await db.query(`
        INSERT INTO comparison_company_names (company_name, company_org_nr, company_field)
        VALUES ($1, $2, $3)
        RETURNING company_id
        `, [dataArray[0].name, dataArray[0].org_nr, dataArray[0].field])
        dbQueryArray.push(userInsertion)
        const companyId = userInsertion.rows[0].company_id as number
        console.log(companyId)
        for (let dataPoint of dataArray){
            try{
                const statusInsertion = await db.query(`
                INSERT INTO comparison_company_status_relationship(company_id, status, queried_year)
                VALUES ($1, '${dataPoint.status}', $2)
                `, [companyId, dataPoint.queried_year])
                const economicInsertion = await db.query(`
                INSERT INTO comparison_economic_data (queried_year, operating_income, operating_profit, result_before_taxes, annual_result, total_assets, company_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [dataPoint.queried_year, dataPoint.operating_income, dataPoint.operating_profit, dataPoint.result_before_taxes, dataPoint.annual_result, dataPoint.total_assets, companyId])
                dbQueryArray.push(economicInsertion)
                dbQueryArray.push(statusInsertion)
            } catch(error){
                dbQueryArray.push(error)
            }
        }
    } catch (error){
        dbQueryArray.push(error)
    }
    return dbQueryArray
}
 */

/* SEARCHBYTAG. Ikke sikker på om beste gjennomføringsmåte. Usikker på om tagname in ANY er for lite spesifikt. Kanskje en inverse tag search, Not In? når brukeren velger en tag, så excluderer searchen alt annet? */


/**
 * Takes in an array of tags. Returns company name, and economic data for each year.
 * Returns all data matching any tags. Very general search. 
 * Adding extra parameters to function allow for spesific queries for spesific numbers.
 * @param tagArray string array containing tags
 * @returns an object {
 * success: boolean,
 * success ? result : error
 * }
 */

/* const searchByTagGeneral = async(tagArray: string[], startYear: number = 0, endYear: number = new Date().getFullYear())=>{
try{
    const data = await db.query(`
    SELECT DISTINCT company_names.company_name, economic_data.queried_year, economic_data.operating_income, economic_data.operating_profit, economic_data.result_before_taxes, economic_data.annual_result, economic_data.total_assets
    FROM companytagrelationship
    INNER JOIN company_names 
        ON companytagrelationship.company_id = company_names.company_id
    INNER JOIN economic_data
        ON economic_data.company_id = company_names.company_id
    WHERE companytagrelationship.tagname = ANY($1)
    AND economic_data.queried_year BETWEEN ${startYear} AND ${endYear}
	ORDER BY company_names.company_name
    `, [tagArray])
    if (data.rowCount != null && data.rowCount > 0) return {success: true, result: data.rows}
    else return {success: true, result: `No Company Fits Any Of The Tags: ${tagArray.join(", ")}`}
} catch (error){
    return {success: false, error}
}   
} */

/**
 * Spesifikk søkefunksjon basert på status. 
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
export const searchByStatusSpesific = async(tagArray: string[], startYear: number= 0, endYear: number = new Date().getFullYear()) => {
    try {
        console.log(tagArray)
        const data = await db.query<queryReturnType>(`
        WITH company_data AS (
            SELECT
                company_names.company_name,
                company_names.company_id,
                company_names.company_field,
                company_names.company_org_nr,
                company_status_relationship.status,
                economic_data.queried_year,
                (
                SELECT jsonb_object_agg(split_part(economic_data_kv.key, '_', 2), jsonb_build_object(
                    'description', code_lookup.code_description,
                    'value', economic_data_kv.ed_value
                ))
                    FROM (
                        SELECT key, value::numeric AS ed_value
                        FROM jsonb_each_text(to_jsonb(economic_data.*) - 'company_id' - 'queried_year' )
                        WHERE value IS NOT NULL
                    ) AS economic_data_kv
                    JOIN code_lookup ON code_lookup.economic_code = UPPER(economic_data_kv.key)
                ) AS queried_data
            FROM company_names
            INNER JOIN economic_data ON economic_data.company_id = company_names.company_id
            INNER JOIN company_status_relationship ON company_status_relationship.company_id = company_names.company_id
            AND company_status_relationship.queried_year = economic_data.queried_year
            WHERE 
                company_status_relationship.status = any($1)
            AND economic_data.queried_year BETWEEN ${startYear} AND ${endYear}
            ORDER BY company_names.company_name, economic_data.queried_year
        ), aggregated_data AS (
            SELECT 
                company_name,
                company_id,
                company_field,
                company_org_nr,
                json_agg(
                    json_build_object(
                        'queried_year', queried_year,
                        'status', status,
                        'queried_data', queried_data
                    )
                ) AS data
            FROM
                company_data
            GROUP BY
                company_name, company_id, company_field, company_org_nr
            ORDER BY
                company_name
        )
        SELECT 
            *
        FROM aggregated_data
        `, [tagArray])
        if (data.rowCount != null && data.rowCount > 0) return { success: true, error: null, result: data.rows }
        else return {success: true, error: null, result: `No Company Found Containing The Tags: ${tagArray.join(", ")}`}
    } catch (error) {
        return { success: false, error: error, result: null }
    }
}

export const searchByName = async(companyNameSnippet: string, startYear: number = 0, endYear:number = new Date().getFullYear())=>{
    try{
        const data = await db.query<queryReturnType>(`
            WITH company_data AS (
                SELECT 
                    company_names.company_name,
                    company_names.company_id,
                    company_names.company_field,
                    company_names.company_org_nr,
                    economic_data.queried_year,
                    economic_data.queried_year,
                    (
                    SELECT jsonb_object_agg(split_part(economic_data_kv.key, '_', 2), jsonb_build_object(
                        'description', code_lookup.code_description,
                        'value', economic_data_kv.ed_value
                    ))
                        FROM (
                            SELECT key, value::numeric AS ed_value
                            FROM jsonb_each_text(to_jsonb(economic_data.*) - 'company_id' - 'queried_year' )
                            WHERE value IS NOT NULL
                        ) AS economic_data_kv
                        JOIN code_lookup ON code_lookup.economic_code = UPPER(economic_data_kv.key)
                    ) AS queried_data
                FROM company_names
                INNER JOIN economic_data ON economic_data.company_id = company_names.company_id
                INNER JOIN company_status_relationship ON company_status_relationship.company_id = company_names.company_id
                WHERE company_names.company_name ILIKE '%' || $1 || '%'
                AND company_status_relationship.queried_year = economic_data.queried_year
                AND economic_data.queried_year BETWEEN ${startYear} AND ${endYear}
                ORDER BY company_names.company_name, economic_data.queried_year
            ), aggregated_data AS (
                SELECT
                    company_name,
                    company_id,
                    company_field,
                    company_org_nr,
                    json_agg(
                        json_build_object(
                            'queried_year', queried_year,
                            'status', status,
                            'queried_data', queried_data
                        )
                    ) AS data
                FROM
                    company_data
                GROUP BY
                    company_name, company_id, company_field, company_org_nr
                ORDER BY
                    company_name
            )
            SELECT 
                *
            FROM
                aggregated_data
            `, [companyNameSnippet])
            if (data.rowCount != null && data.rowCount > 0) return {success: true, error: null, result: data.rows}
            else return {success: true, error: null, result: `No Company Found With Name Containing ${companyNameSnippet}`}
    } catch (error){
        return {success: false, error: error, result: null}
    }
}

export const searchByOrgNr = async(companyOrgNr: string, startYear: number = 0, endYear: number = new Date().getFullYear())=>{
    try{
        const data = await db.query<queryReturnType>(`
        WITH company_data AS (
            SELECT
                company_names.company_name,
                company_names.company_id,
                company_names.company_field,
                company_names.company_org_nr,
                economic_data.queried_year,
                economic_data.queried_year,
                (
                SELECT jsonb_object_agg(split_part(economic_data_kv.key, '_', 2), jsonb_build_object(
                    'description', code_lookup.code_description,
                    'value', economic_data_kv.ed_value
                ))
                    FROM (
                        SELECT key, value::numeric AS ed_value
                        FROM jsonb_each_text(to_jsonb(economic_data.*) - 'company_id' - 'queried_year' )
                        WHERE value IS NOT NULL
                    ) AS economic_data_kv
                    JOIN code_lookup ON code_lookup.economic_code = UPPER(economic_data_kv.key)
                ) AS queried_data
            FROM company_names
            INNER JOIN economic_data ON economic_data.company_id = company_names.company_id
            INNER JOIN company_status_relationship ON company_status_relationship.company_id = company_names.company_id
            WHERE company_names.company_org_nr = $1
            AND company_status_relationship.queried_year = economic_data.queried_year
            AND economic_data.queried_year BETWEEN ${startYear} AND ${endYear}
            ORDER BY company_names.company_name, economic_data.queried_year
        ), aggregated_data AS (
                SELECT
                    company_name,
                    company_id,
                    company_field,
                    company_org_nr,
                    json_agg(
                        json_build_object(
                            'queried_year', queried_year,
                            'status', status,
                            'queried_data', queried_data
                        )
                    ) AS data
                FROM
                    company_data
                GROUP BY
                    company_name, company_id, company_field, company_org_nr
                ORDER BY
                    company_name
            )
            SELECT 
                *
            FROM
                aggregated_data
        `, [companyOrgNr])
        if (data.rowCount !== null && data.rowCount > 0 ){
            return {success: true, error: null, result: data.rows}
        } else return {success: true, error: null, result: `No Company Found With The Org Nr: ${companyOrgNr}`}
    } catch (error){
        return {success: false, error: error, result: null}
    }
}


/**
 * funksjon for å hente tagArray for gjeldene company_id
 * @param companyId 
 * @returns array of tags.
 */
export const getTagsFromCompanyId = async(companyId:number) =>{
    try {
        const data = await db.query<tagnameQueryType>(`
        SELECT status
        FROM company_status_relationship
        WHERE company_id = $1
        `, [companyId])
        return {success: true, error: null, result: data.rows}
    } catch (error) {
        return {success: false, error: error, result: null}
    }
}



/**
 * searchbytag for comparison data.
 * Lager company_data som orginal status søk, så aggrigerer data i Aggregate_data
 * Som leverer AVG og MEDIAN values for hver bit for hvert år.
 *  
 * )
 * @param tagArray Et array av tags.
 * @returns Array av data av typen dataType
 */
export const searchByComparisonStatusSpesific = async(tagArray: string[], startYear: number= 0, endYear: number = new Date().getFullYear()) => {
    try {
        const data = await db.query(`
         WITH company_data AS (
            SELECT
                company_status_relationship.status,
                economic_data.queried_year,
                    (
                    SELECT jsonb_object_agg(split_part(aggregated_data.key_name, '_', 2), 
                        jsonb_build_object(
                        'description', aggregated_data.code_description,
                        'average_value', aggregated_data.avg_value
                    ))
                    FROM (
                        SELECT 
                            economic_data_kv.key as key_name,
                            MAX(code_lookup.code_description) AS code_description,
                            AVG(economic_data_kv.value::numeric) AS avg_value
                        FROM jsonb_each_text(to_jsonb(economic_data.*) - 'company_id' - 'queried_year') AS economic_data_kv
                        JOIN code_lookup ON code_lookup.economic_code = UPPER(economic_data_kv.key)
                        GROUP BY key
                    ) AS aggregated_data
                ) AS queried_data
            FROM company_status_relationship
            INNER JOIN economic_data ON economic_data.company_id = company_status_relationship.company_id
            AND company_status_relationship.queried_year = economic_data.queried_year
            WHERE 
                company_status_relationship.status = any($1)
            AND economic_data.queried_year BETWEEN ${startYear} AND ${endYear}
            ORDER BY economic_data.queried_year
            ), aggregated_data AS (
                SELECT 
                    json_agg(
                        json_build_object(
                            'queried_year', queried_year,
                            'status', status,
                            'queried_data', queried_data
                        )
                    ) AS data
                FROM
                    company_data
            )
            SELECT 
                *
            FROM aggregated_data
        `, [tagArray])
        if (data.rowCount != null && data.rowCount > 0) return { success: true, error: null, result: data.rows }
        else return {success: true, error: null, result: `No Company Found Containing The Tags: ${tagArray.join(", ")}`}
    } catch (error) {
        return { success: false, error: error, result: null }
    }
}



/* TESTING FUNCTIONS */

/* const insertingCompanyNames = await insertData(mockData as CompanyType)

console.log(insertingCompanyNames)  */

/* const searchResults = await searchByStatusSpesific(['preinkubasjon'], 2020, 2024)

console.log(searchResults) 
 */
/* const searchResults = await searchByName("hav")
console.log(searchResults) */

/* const searchResults = await searchByOrgNr(34484040)
console.log(searchResults) */
/* 
const searchResults = await getTagsFromCompanyId(20)
console.log(searchResults) */