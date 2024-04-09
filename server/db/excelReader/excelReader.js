import xlsx from "xlsx";
const options = {
    cellFormula: false,
    cellDates: true,
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
const convertToWorkableObject = () => {
    const restructuredData = {};
    data.forEach(row => {
        if (verifyRowHasData(row)) {
            const grouped_key = `${row.Målbedrift}_${row.Orgnummer}`;
            if (!restructuredData[grouped_key]) {
                restructuredData[grouped_key] = {
                    målbedrift: row.Målbedrift,
                    orgnummer: row.Orgnummer,
                    bransje: row.Bransje,
                    beskrivelse: row.Beskrivelse,
                    idekilde: row.Idekilde,
                    etableringsdato: row.Etableringsdato,
                };
            }
        }
    });
};
