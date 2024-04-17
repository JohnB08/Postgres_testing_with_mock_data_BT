import { db } from "../dbConfig/dbConfig.js";
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
        SELECT * FROM fetch_data_with_fase($1, ${startYear}, ${endYear})
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
            SELECT * FROM fetch_data_based_on_name_snippet($1, ${startYear}, ${endYear})
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
        SELECT * FROM fetch_data_by_org_nr($1, $2, $3)
        `, [Number(companyOrgNr), startYear, endYear]);
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
export const getAllFases = async () => {
    try {
        const data = await db.query(`
        SELECT DISTINCT fase
        FROM lokal_årlig_bedrift_fase_rapport
        `);
        return { success: true, error: undefined, data: data.rows };
    }
    catch (error) {
        return { success: false, error: error, data: undefined };
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
export const searchByComparisonfaseSpesific = async (tagArray, startYear = 2013, endYear = new Date().getFullYear()) => {
    try {
        const averageValuesArray = await db.query(`
        SELECT * FROM create_avg_data_over_set_years($1, ${startYear}, ${endYear})
        `, [tagArray]);
        return { success: true, result: averageValuesArray.rows[0].create_avg_data_over_set_years };
    }
    catch (error) {
        return { success: false, error: error, result: null };
    }
};
