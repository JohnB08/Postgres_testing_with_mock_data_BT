import { db } from "../dbConfig/dbConfig.js";
const createCompanyNameTable = async () => {
    try {
        const data = await db.query(`
    CREATE TABLE IF NOT EXISTS company_names (
        company_name VARCHAR(255) NOT NULL,
        company_id SERIAL PRIMARY KEY,
        company_org_nr VARCHAR(255) UNIQUE NOT NULL,
        company_field VARCHAR(255)
        )`);
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
            CREATE TABLE IF NOT EXISTS company_status_relationship (
                company_id INTEGER REFERENCES company_names(company_id),
                queried_year INTEGER,
                status VARCHAR(255),
                PRIMARY KEY (company_id, queried_year)
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
        CREATE TABLE IF NOT EXISTS economic_data (
            queried_year INTEGER,
            operating_income INTEGER,
            operating_profit INTEGER,
            result_before_taxes INTEGER,
            annual_result INTEGER,
            total_assets INTEGER,
            company_id INTEGER REFERENCES company_names(company_id),
            PRIMARY KEY (company_id, queried_year))
        `);
        return { success: true, data: [data] };
    }
    catch (error) {
        return { success: false, error };
    }
};
const createComparisonCompanyTable = async () => {
    try {
        const data = db.query(`
        CREATE TABLE IF NOT EXISTS comparison_company_names (
            company_name VARCHAR(255) NOT NULL,
            company_id SERIAL PRIMARY KEY,
            company_org_nr VARCHAR(255) UNIQUE NOT NULL,
            company_field VARCHAR(255)) 
        `);
        return { success: true, data };
    }
    catch (error) {
        return { success: false, error };
    }
};
const createComparisonTagRelationship = async () => {
    try {
        const data = db.query(`
        CREATE TABLE IF NOT EXISTS comparison_company_status_relationship (
                company_id INTEGER REFERENCES comparison_company_names(company_id),
                status VARCHAR(255),
                queried_year INTEGER,
                PRIMARY KEY (company_id, queried_year)
            )
        `);
        return { success: true, data };
    }
    catch (error) {
        return { success: false, error };
    }
};
const createEconomicComparisonTable = async () => {
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
        
        `);
    return { success: true, data: data };
};
const setupDatabase = async () => {
    const companyTable = await createCompanyNameTable();
    const relTable = await createTagTable();
    const yearTable = await createYearlyTable();
    const comparisonCompanyTable = await createComparisonCompanyTable();
    const comparisonRelTable = await createComparisonTagRelationship();
    const comparisonYearTable = await createEconomicComparisonTable();
    return [companyTable, relTable, yearTable, comparisonCompanyTable, comparisonRelTable, comparisonYearTable];
};
const testRun = await setupDatabase();
console.log(testRun);
