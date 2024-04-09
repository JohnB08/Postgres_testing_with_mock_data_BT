import xlsx from "xlsx"
import fs from "fs"

const workBook = xlsx.readFile("../LocalData/MiddlemanRepo/INKTotal.xlsx")
const sheetName = workBook.SheetNames[1]
const sheet = workBook.Sheets[sheetName]
const headers = xlsx.utils.sheet_to_json(sheet, {header: 1})[0]
console.log(headers)
/* const data = xlsx.utils.sheet_to_json(sheet)

type ValidDataStructure = {
    Orgnummer: string,
    RapportÅr: string,
    Fase: string,
    Målbedrift: string
}

const verifyRowHasData = (row: unknown):row is ValidDataStructure =>{
    return (
        typeof (row as ValidDataStructure).Målbedrift === "string" &&
        typeof (row as ValidDataStructure).Fase === "string" &&
        typeof (row as ValidDataStructure).Orgnummer === "string" &&
        typeof (row as ValidDataStructure).RapportÅr === "string"
    )
}

const orgData = data.map(row=>{
    if (verifyRowHasData(row)){
        return {
            rapportÅr: row.RapportÅr,
            bedriftNavn: row.Målbedrift,
            orgNr: row.Orgnummer,
            fase: row.Fase
        }
    } else return null
}).filter((el): el is NonNullable<typeof el>=>{
    return el != null
})


const headerList = ["RapportÅr", "Målbedrift", "Orgnummer", "Fase"]

console.log(orgData) */

