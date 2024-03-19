import { db } from "../dbConfig/dbConfig.js";

const createUserTable = async() =>{
try{
    const data = await db.query(`
    CREATE TABLE IF NOT EXISTS company_names (company_name VARCHAR(255) UNIQUE NOT NULL, company_id SERIAL PRIMARY KEY)
    `)
    return {success: true, data}
} catch (error){
    return {success: false, error}
} 

}

const createTagTable = async()=>{
    const testArray = []
        try{
            const data = await db.query(`
            CREATE TABLE IF NOT EXISTS companytagrelationship (
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

const createYearlyTable = async()=>{
    try{
        const data = await db.query(`
        CREATE TABLE IF NOT EXISTS yearlyeconomics (year INTEGER, liquidity INTEGER, operational_cost INTEGER, latest_profit INTEGER, company_id INTEGER REFERENCES company_names(company_id))
        `)
        return {success: true, data}
    } catch (error){
        return {success: false, error}
    }
}

const initializeServer = async()=>{
    const userTable = await createUserTable()
    const relTable = await createTagTable()
    const yearTable = await createYearlyTable()
    return [userTable, relTable, yearTable]
}

const testRun = await initializeServer()
console.log(testRun)