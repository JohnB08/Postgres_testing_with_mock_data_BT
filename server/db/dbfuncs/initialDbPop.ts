
import { db } from "../dbConfig/dbConfig.js";
import { QueryResult } from "pg";
import fs from "fs"
import { cleanedData as excelData } from "../excelReader/excelReader.js"; 
import { verifyErrorExists, verifySuccessQuery, QueryPackage, SuccessfullQueryPackage, UnsuccessfulQueryPackage } from "../verifierFuncs/VerifyDbQuery.js";


type referenceDataType = {
    result: {
        bedrift_data: jsonReferenceData[]
        'distinct_orgnummer': number[]
    }
}

type jsonReferenceData = {
            bedrift_id: number,
            orgnummer: number,
            'gyldige_rapportår': number[]
}

type unifiedData = jsonReferenceData & {
    årsrapporter: ÅrsRapporter[]
        
}

type ÅrsRapporter = {
        currency: any,
        year: any,
        accounts:
            {
            code: any,
            amount: any
            }[]
        }[]

type ProffQueryReturn = {
  companyType: any,
  companyTypeName: any,
  companyId: any,
  registrationDate: any,
  yearsInOperation: any,
  annualAccounts: ÅrsRapporter[],
  naceCategories: any[]
}




/**
 * Funksjon som tar in et datasett, og ser om det passer med det vi er ute etter fra proff, basert på proff json struktur.
 * @param data 
 * @returns 
 */
 const verifyProffData = (data: any): data is ProffQueryReturn =>{
    return (
        typeof data === "object" &&
        Array.isArray((data as ProffQueryReturn).annualAccounts) &&
        (data as ProffQueryReturn).annualAccounts.length > 0 &&
        (data as ProffQueryReturn).companyId
    )
}

const awaitPromise = async(ms: number)=>{
    await new Promise(resolve=>{
        setTimeout(resolve, ms)
    })
} 



/* PREFILLING DATA FROM EXSISTING EXCEL */
const seedDbWithDataFromExcel = async() =>{
    const dataInsertionArray: QueryResult<any>[] = []
    try{
        for (let company of excelData){
            console.log(`inserting companydata for ${company.målbedrift}`)
            const insertIntoCompanyName = await db.query(`
            INSERT INTO bedrift_info (orgnummer, målbedrift${company.bransje != undefined ? ", bransje" : ""}${company.beskrivelse != undefined ? ", beskrivelse" : ""}${company.idekilde != undefined ? ", idekilde" : ""})
            VALUES (${company.orgnummer}, $1${company.bransje != undefined ? `, '${company.bransje}'` : ""}${company.beskrivelse != undefined ? `, '${company.beskrivelse}'` : ""}${company.idekilde != undefined ? `, '${company.idekilde}'` : ""})
            RETURNING bedrift_id
            `, [company.målbedrift])
            dataInsertionArray.push(insertIntoCompanyName)
            const companyId = insertIntoCompanyName.rows[0].bedrift_id as number
            for (let year of company.data){
                console.log(`Inserting data for year ${year.rapportår}`)
                const insertIntoCompanyfase = await db.query(`
                INSERT INTO lokal_årlig_bedrift_fase_rapport (bedrift_id, rapportår, fase)
                VALUES ($1, $2, '${year.fase}')
                `, [companyId, year.rapportår])
                dataInsertionArray.push(insertIntoCompanyfase)
            }
        }
        return {success: true, dataInsertionArray}
    } catch (error){
        return {success: false, error}
    }
}


const fetchApi = async<T>(url: string)=>{
    const key = process.env.PROFF_AUTH_TOKEN
    try {
        const options: RequestInit = {
            method: "GET",
            headers: {
                'Authorization': `Token ${key}`
            }
        }
        const response = await fetch(url, options)
        const result: T = await response.json()
        return {success: true, data: result, error: undefined}
    } catch (error) {
        return {success: false, data: undefined, error: error}
    }
}

const fetchReferenceFromDb: ()=>Promise<QueryPackage<referenceDataType>> = async() =>{
    try{
        const data = await db.query<referenceDataType>(`
        WITH DistinctOrgNummer AS (
            SELECT ARRAY_AGG(DISTINCT orgnummer) AS distinct_orgnummer
            FROM bedrift_info
        ),
        BedriftData AS (
            SELECT
                b.bedrift_id,
                b.orgnummer,
                ARRAY_AGG(r.rapportår) AS gyldige_rapportår
            FROM 
                bedrift_info b
            JOIN 
                lokal_årlig_bedrift_fase_rapport r 
            ON 
                b.bedrift_id = r.bedrift_id
            GROUP BY 
                b.bedrift_id, 
                b.orgnummer
        )
        SELECT
            json_build_object(
                'bedrift_data', (SELECT json_agg(json_build_object('bedrift_id', bedrift_id, 'orgnummer', orgnummer, 'gyldige_rapportår', gyldige_rapportår)) FROM BedriftData),
                'distinct_orgnummer', (SELECT distinct_orgnummer FROM DistinctOrgNummer)
            ) AS result;
        `)
        return {success: true, data: data.rowCount === 0 ? "Nothing Found" : data.rows[0], error: undefined}
    } catch (error) {
        return {success: false, data: undefined, error: error}
    }
}

/**
 * Tar inn resultatet fra proff data query, verifiserer at dataen har det vi vil, og returnerer renset data.
 * Ignorerer også calls hvor Ingen rapporter om økonomi finnes. De vil fremdeles være null i databasen og blir tatt med i avg calls, men bare for årene de er registrert. 
 * @param proffData Query result fra proff data query. 
 * @returns 
 */
 const cleanProffData = (proffData: any[]) => {
    let cleanedData: ProffQueryReturn[] = []
    for (let data of proffData){
        if (verifyProffData(data)){
            cleanedData.push(data)
        }
    }
    return cleanedData
}

const combineReferenceAndProff = (proffData: ProffQueryReturn[], referenceData: jsonReferenceData[])=>{
    const newData: unifiedData[] = []
    for (let data of proffData){
        referenceData.forEach((el)=>{
           if (el.orgnummer === Number(data.companyId)){
            const newEl: unifiedData = {
                orgnummer: el.orgnummer,
                bedrift_id: el.bedrift_id,
                gyldige_rapportår: el.gyldige_rapportår,
                årsrapporter: []
            }
            for (let i = 0; i<el.gyldige_rapportår.length; i++){
                for (let rapportår of data.annualAccounts){
                    if(el.gyldige_rapportår[i] === Number(rapportår.year)){
                        newEl.årsrapporter.push(rapportår)
                    }
                }
            }
            newData.push(newEl)
            }
        })
    }
    return newData
} 

const insertInitialProffData = async(proffData: unifiedData[])=>{
    const errorArray: unknown[] = []
    for (let company of proffData){
        console.log(`Trying to update info for ${company.bedrift_id}`)
        try{
            for (let year of company.gyldige_rapportår){
                await db.query(`
                INSERT INTO økonomisk_data (rapportår, bedrift_id)
                VALUES ($1, $2)
                `, [year, company.bedrift_id])
            }
            for (let year of company.årsrapporter){
                for (let code of year.accounts){
                   try {
                     await db.query(`
                    UPDATE økonomisk_data
                    SET code_${code.code} = $1
                    WHERE rapportår = $2
                    AND bedrift_id = $3
                    `, [Number(code.amount), Number(year.year), company.bedrift_id ])
                   } catch (error){
                    errorArray.push(error)
                   }
                }
            }
            console.log("write successfull")
        } catch (error){
            console.log(`It failed, check log.`)
            errorArray.push(error)
        }
    }
    return errorArray
} 


const seedDbWithInitDataFromProff = async()=>{
    const dbReference = await fetchReferenceFromDb()
    if (verifyErrorExists(dbReference)){
        return console.log(`Something went wrong: ${dbReference.error}`)
    }
    if (typeof dbReference.data === "string"){
        return console.log(dbReference.data)
    }
    if (verifySuccessQuery(dbReference)){
        const referenceArray = dbReference.data.result.bedrift_data
        console.log("Saving reference array")
        fs.writeFileSync("./db/LocalData/ReferenceBackUp.json", JSON.stringify(referenceArray))
        const orgNrArray = dbReference.data.result.distinct_orgnummer
        const dataArray: ProffQueryReturn[] = []
        const errorArray: unknown[] = []
        for (let nr of orgNrArray){
            await awaitPromise(100)
            console.log(`fetching data for ${nr}`)
            const url = `https://api.proff.no/api/companies/register/NO/${nr}`
            const proffResponse = await fetchApi<any>(url)
            if (verifyErrorExists(proffResponse)){
                errorArray.push(proffResponse.error)
            }
            if (verifySuccessQuery(proffResponse)) {
                dataArray.push(proffResponse.data)
            }
        }
        console.log("Backing up proff data")
        fs.writeFileSync("./db/LocalData/ProffBackUp.json", JSON.stringify(dataArray))
        console.log("Backing up errors")
        fs.writeFileSync("./db/LocalData/ErrorBackUp.json", JSON.stringify(errorArray))
        const cleanedProffData = cleanProffData(dataArray)
        const unifiedData = combineReferenceAndProff(cleanedProffData, referenceArray)
        const insertProffDataToDb = await insertInitialProffData(unifiedData)
        return insertProffDataToDb
    }

} 

const seedDb = async()=>{
    console.log("Seeding from Excel.")
    const seedExcel = await seedDbWithDataFromExcel()
    console.log("Done seeding from Excel")
    await awaitPromise(5000)
    console.log("Seeding from Proff")
    const seedProff = await seedDbWithInitDataFromProff()
    console.log("Done seeding from Proff")
    return [seedExcel, seedProff]
}

await seedDb()


