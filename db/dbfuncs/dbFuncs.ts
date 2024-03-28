import { db } from "../dbConfig/dbConfig.js";
//brukes bare for insert av mockData til local database
/* import mockData from "../mockData/mockData.json" assert {type: "json"} */

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
                    INSERT INTO companytagrelationship (company_id, tagname)
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
const searchByTagGeneral = async(tagArray: string[])=>{
try{
    const data = await db.query(`
    SELECT DISTINCT company_names.company_name, economic_data.queried_year, economic_data.operating_income, economic_data.operating_profit, economic_data.result_before_taxes, economic_data.annual_result, economic_data.total_assets
    FROM companytagrelationship
    INNER JOIN company_names 
        ON companytagrelationship.company_id = company_names.company_id
    INNER JOIN economic_data
        ON economic_data.company_id = company_names.company_id
    WHERE companytagrelationship.tagname = ANY($1)
	ORDER BY company_names.company_name
    `, [tagArray])
    return {success: true, result: data.rows}
} catch (error){
    return {success: false, error}
}   
}

/**
 * En mer spesifikk søkefunksjon for tags.
 * 
 * 
 * Subquery WHERE company_names.company_id IN (
 * ...
 * ...
 * HAVING COUNT(DISTINCT tagname) = ${tagArray.length} 
 * Passer på at vi bare får tilbake resultater for bedrifter hvor alle tags i arrayet matcher.
 * 
 * HUSK Å VERIFIE START YEAR OG END YEAR FØR DU BRUKER DENNE FUNKSJONEN.
 *  
 * )
 * @param tagArray Et array av tags.
 * @returns Array av data av typen dataType
 */
const searchByTagSpesific = async(tagArray: string[], startYear: number= 0, endYear: number = new Date().getFullYear()) => {
    try {
        const data = await db.query(`
        SELECT DISTINCT company_names.company_name, economic_data.queried_year, economic_data.operating_income, economic_data.operating_profit, economic_data.result_before_taxes, economic_data.annual_result, economic_data.total_assets
        FROM company_names
        INNER JOIN economic_data ON economic_data.company_id = company_names.company_id
        WHERE company_names.company_id IN (
            SELECT company_id
            FROM companytagrelationship
            WHERE tagname = ANY($1::text[])
            GROUP BY company_id
            HAVING COUNT(DISTINCT tagname) = ${tagArray.length}
        )
        AND economic_data.queried_year BETWEEN ${startYear} AND ${endYear}
        ORDER BY company_names.company_name
        `, [tagArray])
        return { success: true, result: data.rows }
    } catch (error) {
        return { success: false, error }
    }
}

const searchByName = async(companyNameSnippet: string, startYear: number = 0, endYear:number = new Date().getFullYear())=>{
    try{
        const data = await db.query(`
            SELECT DISTINCT company_names.company_name, economic_data.queried_year, economic_data.operating_income, economic_data.operating_profit, economic_data.result_before_taxes, economic_data.annual_result, economic_data.total_assets
            FROM company_names
            INNER JOIN economic_data ON economic_data.company_id = company_names.company_id
            WHERE company_names.company_name ILIKE '%' || $1 || '%'
            AND economic_data.queried_year BETWEEN ${startYear} AND ${endYear}
            `, [companyNameSnippet])
        return {success: true, result: data.rows}
    } catch (error){
        return {success: false, error}
    }
}

const searchByOrgNr = async(companyOrgNr: number, startYear: number = 0, endYear: number = new Date().getFullYear())=>{
    try{
        const stringifiedNr = companyOrgNr.toString()
        const data = await db.query(`
        SELECT DISTINCT company_names.company_name, economic_data.queried_year, economic_data.operating_income, economic_data.operating_profit, economic_data.result_before_taxes, economic_data.annual_result, economic_data.total_assets
        FROM company_names
        INNER JOIN economic_data ON economic_data.company_id = company_names.company_id
        WHERE company_names.company_org_nr = $1
        AND economic_data.queried_year BETWEEN ${startYear} AND ${endYear}
        `, [stringifiedNr])
        if (data.rowCount !== null && data.rowCount > 0 ){
            return {success: true, result: data.rows}
        } else return {success: true, result: "No Company Found."}
    } catch (error){
        return {success: false, error}
    }
}

/* TESTING FUNCTIONS */

/* 
const insertingCompanyNames = []
for (let companyData of mockData){
    try{
        const data = await insertData(companyData)
        insertingCompanyNames.push(data)
    } catch (error){
        insertingCompanyNames.push(error)
    }
}
console.log(insertingCompanyNames) */

const searchResults = await searchByTagSpesific(['marin', 'innovasjon'])

console.log(searchResults)

/* const searchResults = await searchByName("hav")
console.log(searchResults) */

/* const searchResults = await searchByOrgNr(25284583)
console.log(searchResults) */