import { db } from "../dbConfig/dbConfig.js";
import mockData from "../mockData/mockData.json" assert { type: "json" };
console.log(mockData);
const insertData = async (dataArray) => {
    const dbQueryArray = [];
    try {
        const userInsertion = await db.query(`
        INSERT INTO company_names (company_name)
        VALUES ($1)
        RETURNING company_id
        `, [dataArray[0].name]);
        dbQueryArray.push(userInsertion);
        const companyId = userInsertion.rows[0].company_id;
        console.log(companyId);
        for (let tag of dataArray[0].tags) {
            const tagRelation = await db.query(`
                    INSERT INTO companytagrelationship (company_id, tagname)
                    VALUES ($1, '${tag}')
                    RETURNING * 
                    `, [companyId]);
            dbQueryArray.push(tagRelation);
        }
        for (let dataPoint of dataArray) {
            try {
                const economicInsertion = await db.query(`
                INSERT INTO yearlyeconomics (year, liquidity, operational_cost, latest_profit, company_id)
                VALUES ($1, $2, $3, $4, $5)
                `, [dataPoint.year, dataPoint.liquidity, dataPoint.operational_cost, dataPoint.latest_profit, companyId]);
                dbQueryArray.push(economicInsertion);
            }
            catch (error) {
                dbQueryArray.push(error);
            }
        }
    }
    catch (error) {
        dbQueryArray.push(error);
    }
    return dbQueryArray;
};
/* SEARCHBYTAG. Ikke sikker på om beste gjennomføringsmåte. Usikker på om tagname in ANY er for lite spesifikt. Kanskje en inverse tag search, Not In? når brukeren velger en tag, så excluderer searchen alt annet? */
const searchByTag = async (tagArray) => {
    try {
        const data = await db.query(`
    SELECT DISTINCT company_names.company_name, yearlyeconomics.year, yearlyeconomics.liquidity, yearlyeconomics.operational_cost, yearlyeconomics.latest_profit
    FROM companytagrelationship
    INNER JOIN company_names 
        ON companytagrelationship.company_id = company_names.company_id
    INNER JOIN yearlyeconomics
        ON yearlyeconomics.company_id = company_names.company_id
    WHERE companytagrelationship.tagname = ANY('{utvikling}')
    GROUP BY company_names.company_name, yearlyeconomics.year, yearlyeconomics.liquidity, yearlyeconomics.operational_cost, yearlyeconomics.latest_profit
    ORDER BY company_names.company_name, yearlyeconomics.year
    `, [tagArray]);
        return { success: true, data };
    }
    catch (error) {
        return { success: false, error };
    }
};
const insertingCompanyNames = [];
for (let companyData of mockData) {
    try {
        const data = await insertData(companyData);
        insertingCompanyNames.push(data);
    }
    catch (error) {
        insertingCompanyNames.push(error);
    }
}
console.log(insertingCompanyNames);
