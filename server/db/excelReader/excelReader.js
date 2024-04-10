import xlsx from "xlsx";
import { isKey } from "../dbfuncs/regexTest.js";
const options = {
    cellFormula: false,
    cellDates: true,
    raw: true,
};
const workBook = xlsx.readFile("../LocalData/MiddlemanRepo/INKTotal.xlsx", options);
const sheetName = workBook.SheetNames[1];
const sheet = workBook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);
const verifyRowHasData = (row) => {
    return (typeof row === "object" &&
        typeof row.Målbedrift === "string" &&
        typeof row.Fase === "string" &&
        typeof row.Orgnummer === "string" &&
        typeof row.RapportÅr === "string");
};
const strippedData = data.map(row => {
    if (verifyRowHasData(row)) {
        const keys = Object.keys(row);
        keys.forEach(key => {
            if (isKey(row, key)) {
                if (!key.includes('Antall') && !key.includes('Markedsverdien') && !key.includes('støtteintensitet') && (Number(row[key]) === 1 || Number(row[key]) === 0)) {
                    row[key] = Boolean(Number(row[key]));
                }
                if (row[key] === 'False') {
                    row[key] = false;
                }
                if (row[key] === 'True') {
                    row[key] = true;
                }
                if (!Number.isNaN(Number(row[key])) && typeof row[key] != "boolean") {
                    row[key] = Number(row[key]);
                }
            }
        });
        return row;
    }
    else
        return null;
}).filter((el) => {
    return el != null;
});
const convertToWorkableObject = () => {
    const restructuredData = {};
    strippedData.forEach(row => {
        const grouped_key = `${row.Målbedrift}_${row.Orgnummer}`;
        if (!restructuredData[grouped_key]) {
            restructuredData[grouped_key] = {
                målbedrift: row['Målbedrift'],
                orgnummer: row['Orgnummer'],
                bransje: row['Bransje'],
                beskrivelse: row['Beskrivelse'],
                idekilde: row['Idekilde'],
                data: [{
                        rapportår: row['Rapportår'],
                        fase: row['Fase']
                    }]
            };
        }
        else
            restructuredData[grouped_key].data.push({
                rapportår: row['Rapportår'],
                fase: row['Fase']
            });
    });
    return Object.values(restructuredData);
};
export const cleanedData = convertToWorkableObject();
