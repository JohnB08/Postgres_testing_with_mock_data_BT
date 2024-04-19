import { db } from "../dbConfig/dbConfig.js";
import { isKey } from "../verifierFuncs/isKey.js";
import { economicCodes } from "../LocalData/EconomicCodes.js";
import { QueryResult } from "pg"

export const economicTables = Object.keys(economicCodes).map(key=>`CODE_${key} DOUBLE PRECISION DEFAULT NULL, `).join("")

const createCompanyNameTable = async() =>{
try{
    const data = await db.query(`
    CREATE TABLE IF NOT EXISTS bedrift_info (
        bedrift_id SERIAL PRIMARY KEY,
        orgnummer INTEGER NOT NULL,
        målbedrift TEXT NOT NULL,
        bransje TEXT DEFAULT NULL,
        beskrivelse TEXT DEFAULT NULL,
        idekilde TEXT DEFAULT NULL
        )`)
    return {success: true, data}
} catch (error){
    return {success: false, error}
} 

}

const createStatusTable = async()=>{
    const testArray = []
        try{
            const data = await db.query(`
            CREATE TABLE IF NOT EXISTS lokal_årlig_bedrift_fase_rapport (
                bedrift_id INTEGER REFERENCES bedrift_info(bedrift_id),
                rapportår INTEGER,
                fase VARCHAR(255),
                PRIMARY KEY (bedrift_id, rapportår)
            )
            `)
            testArray.push({success: true, data})
        } catch (error){
            testArray.push({success: false, error})
        }
    return testArray
}



/**
 * Hver ØKO_KODE fra proff er lagret som CODE_<kode>, for å gå rundt protected keywords i postgres.
 *  
 * @returns 
 */
const createYearlyTable = async()=>{
    try{
        const data = await db.query(`
        CREATE TABLE IF NOT EXISTS økonomisk_data (
            rapportår INTEGER,
            ${economicTables}
            bedrift_id INTEGER REFERENCES bedrift_info(bedrift_id),
            PRIMARY KEY (bedrift_id, rapportår)
            )
        `)
        return {success: true, data: [data]}
    } catch (error){
        return {success: false, error}
    }
}

/**
 * Hver kode husk at hver kode er satt opp som CODE_<kodenavn>, for å unngå protected keyword konflikt.
 * @returns 
 */
const createCodeLookUpTable = async()=>{
    try{
        const insertArray: QueryResult<any>[] = []
        const data = await db.query(`
        CREATE TABLE IF NOT EXISTS code_lookup (
            code_id SERIAL PRIMARY KEY,
            economic_code VARCHAR(255),
            code_description VARCHAR(255)
        )
        `)
        insertArray.push(data)
        const keyArray = Object.keys(economicCodes)
        
        for (let code of keyArray){
            if (isKey(economicCodes, code)){
                const codeInsert = await db.query(`
                INSERT INTO code_lookup(economic_code, code_description)
                VALUES ('CODE_${code}', '${economicCodes[code]}')
                `)
                insertArray.push(codeInsert)
            }
        }
        return {success: true, data: insertArray}
    } catch (error){
        return {success: false, error}
    }
}

/* const createComparisonCompanyTable = async() =>{
    try{
        const data = db.query(`
        CREATE TABLE IF NOT EXISTS comparison_company_names (
            company_name VARCHAR(255) NOT NULL,
            company_id SERIAL PRIMARY KEY,
            company_org_nr VARCHAR(255) UNIQUE NOT NULL,
            company_field VARCHAR(255)) 
        `)
        return{success: true, data}
    } catch (error){
        return {success: false, error}
    }

}

const createComparisonTagRelationship = async()=>{
    try {
        const data = db.query(`
        CREATE TABLE IF NOT EXISTS comparison_company_status_relationship (
                company_id INTEGER REFERENCES comparison_company_names(company_id),
                status VARCHAR(255),
                queried_year INTEGER,
                PRIMARY KEY (company_id, queried_year)
            )
        `)
        return {success: true, data}
    } catch (error){
        return {success: false, error}
    }
}

const createEconomicComparisonTable = async()=>{
    const data = await db.query(`
        CREATE TABLE IF NOT EXISTS comparison_economic_data (
            queried_year INTEGER,
            operating_income INTEGER,
            operating_profit INTEGER,
            result_before_taxes INTEGER,
            annual_result INTEGER,
            total_assets INTEGER,
            company_id INTEGER REFERENCES comparison_company_names(company_id),
            PRIMARY KEY (company_id, queried_year)
            )
        
        `)
        return {success: true, data: data}
} */


const setupDatabase = async()=>{
    const companyTable = await createCompanyNameTable();
    const relTable = await createStatusTable();
    const yearTable = await createYearlyTable();
    const codeLookupTable = await createCodeLookUpTable();
    return [companyTable, relTable, yearTable, codeLookupTable]
}

const testRun = await setupDatabase()
console.log(testRun)