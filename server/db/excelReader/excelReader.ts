import xlsx from "xlsx"
import { isKey } from "../verifierFuncs/isKey.js"
const options = {
    cellFormula: false,
    cellDates: true,
    raw: true,
};
console.log(process.cwd())

const workBook = xlsx.readFile("./db/LocalData/INKTotal.xlsx", options)
const sheetName = workBook.SheetNames[1]
const sheet = workBook.Sheets[sheetName]
const data = xlsx.utils.sheet_to_json(sheet)

type ValidDataStructure = {
    [key: string]: any
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
   [key: string]: {
    målbedrift: string,
    orgnummer: number,
    bransje: string,
    beskrivelse: string,
    idekilde: string,
    data: {
        rapportår: number,
        fase: string,
    }[]
   }
}

const strippedData = data.map(row=>{
    if (verifyRowHasData(row)){
        const keys = Object.keys(row)
        keys.forEach(key=>{
            if (isKey(row, key)){
                if (!key.includes('Antall') && !key.includes('Markedsverdien') && !key.includes('støtteintensitet') && (Number(row[key]) === 1 || Number(row[key]) === 0)){
                    row[key] = Boolean(Number(row[key]))
                }
                if (row[key] === 'False'){
                    row[key] = false
                }
                if (row[key] === 'True'){
                    row[key] = true
                }
                if (!Number.isNaN(Number(row[key])) && typeof row[key] != "boolean"){
                    row[key] = Number(row[key])
                }
            }
        })
        return row
    } else return null
}).filter((el): el is NonNullable<typeof el>=>{
    return el != null
})


const convertToWorkableObject = () =>{
    const restructuredData: RestructData = {}
    strippedData.forEach(row=>{
            const grouped_key = `${(row.Målbedrift as string).toLocaleUpperCase()}_${row.Orgnummer}`
            if (!restructuredData[grouped_key]){
                restructuredData[grouped_key] = {
                    målbedrift: row['Målbedrift'],
                    orgnummer: row['Orgnummer'],
                    bransje: row['Bransje'],
                    beskrivelse: row['Beskrivelse'] === undefined ? row['Beskrivelse'] : row['Beskrivelse'].replace(/'/g, '’'), 
                    idekilde: row['Idekilde'],
                    data: [{
                        rapportår: row['RapportÅr'],
                        fase: row['Fase']
                    }]
                }
            } 
            else {
                const exists = restructuredData[grouped_key].data.some(el=>
                    el.rapportår === row['RapportÅr']
                )
                if (!exists) {
                    restructuredData[grouped_key].data.push({
                        rapportår: row['RapportÅr'],
                        fase: row['Fase']
                    })
                }
            } 
    })
    return Object.values(restructuredData)
}

export const cleanedData = convertToWorkableObject()