import xlsx from "xlsx"
const options = {
    cellFormula: false,
    cellDates: true,
};
const workBook = xlsx.readFile("../LocalData/MiddlemanRepo/INKTotal.xlsx", options)
const sheetName = workBook.SheetNames[1]
const sheet = workBook.Sheets[sheetName]
const data = xlsx.utils.sheet_to_json(sheet)

type ValidDataStructure = {
    [key: string]: string
}

const verifyRowHasData = (row: unknown):row is ValidDataStructure =>{
    return (
        typeof row === "object" &&
        typeof (row as ValidDataStructure).Målbedrift === "string" &&
        typeof (row as ValidDataStructure).Fase === "string" &&
        typeof (row as ValidDataStructure).Orgnummer === "string" &&
        typeof (row as ValidDataStructure).RapportÅr === "string" 
    )
}

type RestructData = {
    [key: string]: string | object
}

const convertToWorkableObject = () =>{
    const restructuredData: RestructData = {}
    data.forEach(row=>{
    if (verifyRowHasData(row)){
        const grouped_key = `${row.Målbedrift}_${row.Orgnummer}`
        if (!restructuredData[grouped_key]){
            restructuredData[grouped_key] = {
                målbedrift: row.Målbedrift,
                orgnummer: row.Orgnummer,
                bransje: row.Bransje,
                beskrivelse: row.Beskrivelse,
                idekilde: row.Idekilde,
                etableringsdato: row.Etableringsdato,
            }
        }
    }
})
}