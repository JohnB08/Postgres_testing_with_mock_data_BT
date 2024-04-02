import { db } from "../dbConfig/dbConfig.js";



const createCompanyNameTable = async() =>{
try{
    const data = await db.query(`
    CREATE TABLE IF NOT EXISTS company_names (company_name VARCHAR(255) UNIQUE NOT NULL, company_id SERIAL PRIMARY KEY, company_org_nr VARCHAR(255))`)
    return {success: true, data}
} catch (error){
    return {success: false, error}
} 

}

const createTagTable = async()=>{
    const testArray = []
        try{
            const data = await db.query(`
            CREATE TABLE IF NOT EXISTS company_tag_relationship (
                company_id INTEGER REFERENCES company_names(company_id),
                tagName VARCHAR(255),
                PRIMARY KEY (company_id, tagName)
            )
            `)
            testArray.push({success: true, data})
        } catch (error){
            testArray.push({success: false, error})
        }
    return testArray
}


/* Kan det lages funksjoner basert på denne? kanskje vi kan lage en funksjon som kan regne ut levlighetsgrad basert på data over tid for bransje?
Eller bør de gjøres på frontend siden? Undersøkes senere. Ikke viktig nå.*/

const createYearlyTable = async(startYearLowerLimit: number, startYearUpperLimit: number)=>{
    try{
        const data = await db.query(`
        CREATE TABLE IF NOT EXISTS economic_data (queried_year INTEGER, operating_income INTEGER, operating_profit INTEGER, result_before_taxes INTEGER, annual_result INTEGER, total_assets INTEGER, company_id INTEGER REFERENCES company_names(company_id)) PARTITION BY RANGE (queried_year)
        `)
        const subTableArray = []
        for (let startYear = startYearLowerLimit; startYear <= startYearUpperLimit; startYear+=5){
            const subTableData = await db.query(`
            CREATE TABLE economic_data_${startYear}_${startYear+4} PARTITION OF economic_data
            FOR VALUES FROM (${startYear}) TO (${startYear+5})
            `)
            subTableArray.push(subTableData)
        }
        return {success: true, data: [data, subTableArray]}
    } catch (error){
        return {success: false, error}
    }
}


const createComparisonCompanyTable = async() =>{
    try{
        const data = db.query(`
        CREATE TABLE IF NOT EXISTS comparison_company_names (company_name VARCHAR(255) UNIQUE NOT NULL, company_id SERIAL PRIMARY KEY, company_org_nr VARCHAR(255)) 
        `)
        return{success: true, data}
    } catch (error){
        return {success: false, error}
    }

}

const createComparisonTagRelationship = async()=>{
    try {
        const data = db.query(`
        CREATE TABLE IF NOT EXISTS comparison_company_tag_relationship (
                company_id INTEGER REFERENCES comparison_company_names(company_id),
                tagName VARCHAR(255),
                PRIMARY KEY (company_id, tagName)
            )
        `)
        return {success: true, data}
    } catch (error){
        return {success: false, error}
    }
}

const createEconomicComparisonTable = async(startYearLowerLimit: number, startYearUpperLimit: number)=>{
    const data = await db.query(`
        CREATE TABLE IF NOT EXISTS comparison_economic_data (queried_year INTEGER, operating_income INTEGER, operating_profit INTEGER, result_before_taxes INTEGER, annual_result INTEGER, total_assets INTEGER, company_id INTEGER REFERENCES comparison_company_names(company_id)) PARTITION BY RANGE (queried_year)
        `)
        const subTableArray = []
        for (let startYear = startYearLowerLimit; startYear <= startYearUpperLimit; startYear+=5){
            const subTableData = await db.query(`
            CREATE TABLE comparison_economic_data_${startYear}_${startYear+4} PARTITION OF comparison_economic_data
            FOR VALUES FROM (${startYear}) TO (${startYear+5})
            `)
            subTableArray.push(subTableData)
        }
        return {success: true, data: [data, subTableArray]}
}


const setupDatabase = async()=>{
    const companyTable = await createCompanyNameTable();
    const relTable = await createTagTable();
    const yearTable = await createYearlyTable(1999, 2025);
    const comparisonCompanyTable = await createComparisonCompanyTable();
    const comparisonRelTable = await createComparisonTagRelationship();
    const comparisonYearTable = await createEconomicComparisonTable(1999, 2025);
    return [companyTable, relTable, yearTable, comparisonCompanyTable, comparisonRelTable, comparisonYearTable]
}

const testRun = await setupDatabase()
console.log(testRun)