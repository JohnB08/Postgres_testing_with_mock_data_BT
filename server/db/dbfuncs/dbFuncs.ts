import { db } from "../dbConfig/dbConfig.js";
//brukes bare for insert av mockData til local database
import mockData from "../mockData/mockData.json" assert {type: "json"}
import comparisonMockData from "../mockData/comparisonMockData.json" assert {type: "json"}


/* RESTRUKTURER TIL Å VÆRE TILPASSET INKUBATORSTATUS! */

type dataType = {
    name: string,
    org_nr: string,
    operating_income: number,
    operating_profit: number,
    result_before_taxes: number,
    annual_result: number,
    total_assets: number,
    tags: string[],
    queried_year: number
}

/* company_names.company_id, economic_data.queried_year, economic_data.operating_income, economic_data.operating_profit, economic_data.result_before_taxes, economic_data.annual_result, economic_data.total_assets, */

type queryReturnType = {
            company_name: string,
            company_id: number,
            data: [
                    {
                    queried_year: number,
                    queried_data: [
                            {
                            operating_income: number,
                            operating_profit: number,
                            result_before_taxes: number,
                            annual_result: number,
                            total_assets: number
                        }
                    ]
                }
            ]

}

type tagnameQueryType = {
    tagname: string
}


const insertData = async(dataArray: dataType[]) =>{
    const dbQueryArray = []
    try{
        const userInsertion = await db.query(`
        INSERT INTO company_names (company_name, company_org_nr)
        VALUES ($1, $2)
        RETURNING company_id
        `, [dataArray[0].name, dataArray[0].org_nr])
        dbQueryArray.push(userInsertion)
        const companyId = userInsertion.rows[0].company_id as number
        console.log(companyId)
        for (let tag of dataArray[0].tags){
                    const tagRelation = await db.query(`
                    INSERT INTO company_tag_relationship (company_id, tagname)
                    VALUES ($1, '${tag}')
                    RETURNING * 
                    `, [companyId])
                    dbQueryArray.push(tagRelation)
                }
        for (let dataPoint of dataArray){
            try{
                const economicInsertion = await db.query(`
                INSERT INTO economic_data (queried_year, operating_income, operating_profit, result_before_taxes, annual_result, total_assets, company_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [dataPoint.queried_year, dataPoint.operating_income, dataPoint.operating_profit, dataPoint.result_before_taxes, dataPoint.annual_result, dataPoint.total_assets, companyId])
                dbQueryArray.push(economicInsertion)
            } catch(error){
                dbQueryArray.push(error)
            }
        }
    } catch (error){
        dbQueryArray.push(error)
    }
    return dbQueryArray
}
const insertComparisonData = async(dataArray: dataType[]) =>{
    const dbQueryArray = []
    try{
        const userInsertion = await db.query(`
        INSERT INTO comparison_company_names (company_name, company_org_nr)
        VALUES ($1, $2)
        RETURNING company_id
        `, [dataArray[0].name, dataArray[0].org_nr])
        dbQueryArray.push(userInsertion)
        const companyId = userInsertion.rows[0].company_id as number
        console.log(companyId)
        for (let tag of dataArray[0].tags){
                    const tagRelation = await db.query(`
                    INSERT INTO comparison_company_tag_relationship (company_id, tagname)
                    VALUES ($1, '${tag}')
                    RETURNING * 
                    `, [companyId])
                    dbQueryArray.push(tagRelation)
                }
        for (let dataPoint of dataArray){
            try{
                const economicInsertion = await db.query(`
                INSERT INTO comparison_economic_data (queried_year, operating_income, operating_profit, result_before_taxes, annual_result, total_assets, company_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [dataPoint.queried_year, dataPoint.operating_income, dataPoint.operating_profit, dataPoint.result_before_taxes, dataPoint.annual_result, dataPoint.total_assets, companyId])
                dbQueryArray.push(economicInsertion)
            } catch(error){
                dbQueryArray.push(error)
            }
        }
    } catch (error){
        dbQueryArray.push(error)
    }
    return dbQueryArray
}


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
 * En mer spesifikk søkefunksjon for tags.
 * 
 * 
 * Subquery WHERE company_names.company_id IN (
 * ...
 * ...
 * HAVING COUNT(DISTINCT tagname) = ${tagArray.length} 
 * Passer på at vi bare får tilbake resultater for bedrifter hvor alle tags i arrayet matcher.
 * F.eks hvis bedriften bare har 2 av 3 tags, er COUNT(DISTINCT tagname) mindre enn tagArray.length og bedriften blir ikke tatt med. 
 * 
 * HUSK Å VERIFIE START YEAR OG END YEAR FØR DU BRUKER DENNE FUNKSJONEN.
 *  
 * )
 * @param tagArray Et array av tags.
 * @returns Array av data av typen dataType
 */
export const searchByTagSpesific = async(tagArray: string[], startYear: number= 0, endYear: number = new Date().getFullYear()) => {
    try {
        const data = await db.query<queryReturnType>(`
        WITH company_data AS (
            SELECT
                company_names.company_name,
                company_names.company_id,
                economic_data.queried_year,
                json_agg(
                        json_build_object(
                            'operating_income', economic_data.operating_income,
                            'operating_profit', economic_data.operating_profit,
                            'result_before_taxes', economic_data.result_before_taxes,
                            'annual_result', economic_data.annual_result,
                            'total_assets', economic_data.total_assets
                        )
                    ) AS queried_data
            FROM company_names
            INNER JOIN economic_data ON economic_data.company_id = company_names.company_id
            WHERE company_names.company_id IN (
                SELECT company_id
                FROM company_tag_relationship
                WHERE tagname = ANY($1)
                GROUP BY company_id
                HAVING COUNT(DISTINCT tagname) = ${tagArray.length}
            )
            AND economic_data.queried_year BETWEEN ${startYear} AND ${endYear}
            GROUP BY company_names.company_name, company_names.company_id, economic_data.queried_year
            ORDER BY company_names.company_name, economic_data.queried_year
        ), aggregated_data AS (
            SELECT 
                company_name,
                company_id,
                json_agg(
                    json_build_object(
                        'queried_year', queried_year,
                        'queried_data', queried_data
                    )
                ) AS data
            FROM
                company_data
            GROUP BY
                company_name, company_id
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
                    economic_data.queried_year,
                    json_agg(
                        json_build_object(
                            'operating_income', economic_data.operating_income,
                            'operating_profit', economic_data.operating_profit,
                            'result_before_taxes', economic_data.result_before_taxes,
                            'annual_result', economic_data.annual_result,
                            'total_assets', economic_data.total_assets
                        )
                    ) AS queried_data
                FROM company_names
                INNER JOIN economic_data ON economic_data.company_id = company_names.company_id
                WHERE company_names.company_name ILIKE '%' || $1 || '%'
                AND economic_data.queried_year BETWEEN ${startYear} AND ${endYear}
                GROUP BY company_names.company_name, company_names.company_id, economic_data.queried_year
                ORDER BY company_names.company_name, economic_data.queried_year
            ), aggregated_data AS (
                SELECT
                    company_name,
                    company_id,
                    json_agg(
                        json_build_object(
                            'queried_year', queried_year,
                            'queried_data', queried_data
                        )
                    ) AS data
                FROM
                    company_data
                GROUP BY
                    company_name, company_id
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
                economic_data.queried_year,
                json_agg(
                    json_build_object(
                        'operating_income', economic_data.operating_income,
                        'operating_profit', economic_data.operating_profit,
                        'result_before_taxes', economic_data.result_before_taxes,
                        'annual_result', economic_data.annual_result,
                        'total_assets', economic_data.total_assets
                    )
                ) AS queried_data
            FROM company_names
            INNER JOIN economic_data ON economic_data.company_id = company_names.company_id
            WHERE company_names.company_org_nr = $1
            AND economic_data.queried_year BETWEEN ${startYear} AND ${endYear}
            GROUP BY company_names.company_name, company_names.company_id, economic_data.queried_year
            ORDER BY company_names.company_name, economic_data.queried_year
        ), aggregated_data AS (
                SELECT
                    company_name,
                    company_id,
                    json_agg(
                        json_build_object(
                            'queried_year', queried_year,
                            'queried_data', queried_data
                        )
                    ) AS data
                FROM
                    company_data
                GROUP BY
                    company_name, company_id
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
        SELECT tagName
        FROM company_tag_relationship
        WHERE company_id = $1
        `, [companyId])
        return {success: true, error: null, result: data.rows}
    } catch (error) {
        return {success: false, error: error, result: null}
    }
}



/**
 * searchbytag for comparison data.
 * Lager company_data som orginal tag søk, så aggrigerer data i Aggregate_data
 * Som leverer AVG og MEDIAN values for hver bit for hvert år.
 *  
 * )
 * @param tagArray Et array av tags.
 * @returns Array av data av typen dataType
 */
export const searchByComparisonTagSpesific = async(tagArray: string[], startYear: number= 0, endYear: number = new Date().getFullYear()) => {
    try {
        const data = await db.query(`
        WITH company_data AS (
            SELECT DISTINCT comparison_company_names.company_name, comparison_economic_data.queried_year, comparison_economic_data.operating_income, comparison_economic_data.operating_profit, comparison_economic_data.result_before_taxes, comparison_economic_data.annual_result, comparison_economic_data.total_assets
            FROM comparison_company_names
            INNER JOIN comparison_economic_data ON comparison_economic_data.company_id = comparison_company_names.company_id
            WHERE comparison_company_names.company_id IN (
                SELECT company_id
                FROM comparison_company_tag_relationship
                WHERE tagname = ANY($1)
                GROUP BY company_id
                HAVING COUNT(DISTINCT tagname) = ${tagArray.length}
            )
            AND comparison_economic_data.queried_year BETWEEN ${startYear} AND ${endYear}
            ORDER BY comparison_company_names.company_name
        ), aggregated_data AS (
            SELECT 
                queried_year,
                AVG(operating_income) AS mean_operating_income,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY operating_income) AS median_operating_income,
                AVG(operating_profit) AS mean_operating_profit,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY operating_profit) AS median_operating_profit,
                AVG(result_before_taxes) AS mean_result_before_taxes,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY result_before_taxes) AS median_result_before_taxes,
                AVG(annual_result) AS mean_annual_result,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY annual_result) AS median_annual_result,
                AVG(total_assets) AS mean_total_assets,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_assets) AS median_total_assets
            FROM
                company_data
            GROUP BY
                queried_year
            ORDER BY
                queried_year
        )
        SELECT * FROM aggregated_data
        `, [tagArray])
        if (data.rowCount != null && data.rowCount > 0) return { success: true, error: null, result: data.rows }
        else return {success: true, error: null, result: `No Company Found Containing The Tags: ${tagArray.join(", ")}`}
    } catch (error) {
        return { success: false, error: error, result: null }
    }
}



/* TESTING FUNCTIONS */
/* const insertingCompanyNames = []
for (let companyData of mockData){
    try{
        const data = await insertData(companyData)
        insertingCompanyNames.push(data)
    } catch (error){
        insertingCompanyNames.push(error)
    }
}
const insertingComparisonCompanyNames = []
for (let companyData of comparisonMockData){
    try{
        const data = await insertComparisonData(companyData)
        insertingComparisonCompanyNames.push(data)
    } catch (error){
        insertingComparisonCompanyNames.push(error)
    }
}

console.log(insertingCompanyNames, insertingComparisonCompanyNames)  */
/* 
const searchResults = await searchByTagSpesific(['marin', 'innovasjon', 'skytjenester'], 2016, 2024)

console.log(searchResults) */

/* const searchResults = await searchByName("hav")
console.log(searchResults) */

/* const searchResults = await searchByOrgNr(34484040)
console.log(searchResults) */
/* 
const searchResults = await getTagsFromCompanyId(20)
console.log(searchResults) */