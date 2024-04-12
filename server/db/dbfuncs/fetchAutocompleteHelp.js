import { db } from "../dbConfig/dbConfig.js";
import fs from "fs";
const importAutoCompleteHelp = async () => {
    try {
        const fetchedJson = await db.query(`
        SELECT array_agg(
            json_build_object(
            'label', målbedrift, 
            'id', orgnummer
            )
        )
        FROM bedrift_info
        `);
        const jsonString = fetchedJson.rows[0].array_agg;
        console.log(jsonString);
        fs.writeFileSync("../LocalData/autocompleteHelper.js", JSON.stringify(jsonString));
    }
    catch (error) {
        console.log(error);
    }
};
await importAutoCompleteHelp();
