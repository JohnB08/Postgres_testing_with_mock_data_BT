import { db } from "../dbConfig/dbConfig.js";
const createUserTable = async () => {
    try {
        const data = await db.query(`
    CREATE TABLE IF NOT EXISTS company_names (company_name VARCHAR(255) UNIQUE NOT NULL, company_id SERIAL PRIMARY KEY, company_org_nr VARCHAR(255))`);
        return { success: true, data };
    }
    catch (error) {
        return { success: false, error };
    }
};
const createTagTable = async () => {
    const testArray = [];
    try {
        const data = await db.query(`
            CREATE TABLE IF NOT EXISTS companytagrelationship (
                company_id INTEGER REFERENCES company_names(company_id),
                tagName VARCHAR(255),
                PRIMARY KEY (company_id, tagName)
            )
            `);
        testArray.push({ success: true, data });
    }
    catch (error) {
        testArray.push({ success: false, error });
    }
    return testArray;
};
/* Kan det lages funksjoner basert på denne? kanskje vi kan lage en funksjon som kan regne ut levlighetsgrad basert på data over tid for bransje?
Eller bør de gjøres på frontend siden? Undersøkes senere. Ikke viktig nå.*/
const createYearlyTable = async () => {
    try {
        const data = await db.query(`
        CREATE TABLE IF NOT EXISTS economic_data (queried_year INTEGER, operating_income INTEGER, operating_profit INTEGER, result_before_taxes INTEGER, annual_result INTEGER, total_assets INTEGER, company_id INTEGER REFERENCES company_names(company_id)) PARTITION BY RANGE (queried_year)
        `);
        const subTableArray = [];
        for (let startYear = 2010; startYear <= 2025; startYear += 5) {
            const subTableData = await db.query(`
            CREATE TABLE economic_data_${startYear}_${startYear + 4} PARTITION OF economic_data
            FOR VALUES FROM (${startYear}) TO (${startYear + 5})
            `);
            subTableArray.push(subTableData);
        }
        return { success: true, data: [data, subTableArray] };
    }
    catch (error) {
        return { success: false, error };
    }
};
const initializeServer = async () => {
    const userTable = await createUserTable();
    const relTable = await createTagTable();
    const yearTable = await createYearlyTable();
    return [userTable, relTable, yearTable];
};
const testRun = await initializeServer();
console.log(testRun);
