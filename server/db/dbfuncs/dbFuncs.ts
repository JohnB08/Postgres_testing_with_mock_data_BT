import { QueryResult } from "pg";
import { db } from "../dbConfig/dbConfig.js";
//brukes bare for insert av mockData til local database
/* import mockData from "../mockData/mockData.json" assert {type: "json"}

import { CompanyType } from "./chatgptMockDataGeneration.js"; */
/* import { cleanedData } from "../excelReader/excelReader.js";  */

/* !! Når du jobber med store json filer ser det ut som du må bruke typeassertion for å fortelle typescript hva du jobber med. Det er for stort for Intellisense. */
/* import referenceData from "../LocalData/ReferenceBackUp.json" assert {type: "json"}
import proffData from "../LocalData/ProffBackUp.json" assert {type: "json"}  */
/* import { economicCodes } from "../mockData/responseConstructor.js"; */
/* import fs from "fs" */
import { economickeys } from "../mockData/responseConstructor.js";
/* RESTRUKTURER TIL Å VÆRE TILPASSET INKUBATORfase! */


/* bedrift_info.bedrift_id, økonomisk_data.rapportår, økonomisk_data.operating_income, økonomisk_data.operating_profit, økonomisk_data.result_before_taxes, økonomisk_data.annual_result, økonomisk_data.total_assets, */

type queryReturnType = {
            målbedrift: string,
            bedrift_id: number,
            bransje: string,
            data: [
                    {
                    rapportår: number,
                    queried_data: {
                            [key: string]: number
                        }
                }
            ]

}

type tagnameQueryType = {
    tagname: string
}
/* 
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
        "currency": any,
        "year": any,
        "accounts":
            {
            "code": any,
            "amount": any
            }[]
        }[]

type ProffQueryReturn = {
  "companyType": any,
  "companyTypeName": any,
  "companyId": any,
  "registrationDate": any,
  "yearsInOperation": any,
  "annualAccounts": ÅrsRapporter[],
  "naceCategories": any[]
}

type QueryPackage<T> = {
    success: boolean,
    data: T | string,
    error: undefined
} | {
    success: boolean,
    data: undefined,
    error: unknown
}

type UnsuccessfulQueryPackage = QueryPackage<any> & {
    success: false,
    data: undefined,
    error: unknown
}
type SuccessfullQueryPackage<T> = QueryPackage<T> & {
    success: true,
    data: T,
    error: undefined
}


const verifyErrorExists = (object: QueryPackage<any>): object is UnsuccessfulQueryPackage => {
    return (
        typeof object === "object" &&
        (object as UnsuccessfulQueryPackage).success === false
    )
}

const verifySuccessQuery = <T>(object: QueryPackage<T>): object is SuccessfullQueryPackage<T> =>{
    return (
        typeof object === "object" &&
        (object as SuccessfullQueryPackage<T>).success === true && 
        typeof (object as SuccessfullQueryPackage<T>).data != "string"
    )
}
 */

/**
 * Funksjon som tar in et datasett, og ser om det passer med det vi er ute etter fra proff, basert på proff json struktur.
 * @param data 
 * @returns 
 */
/* const verifyProffData = (data: any): data is ProffQueryReturn =>{
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
} */

/* 
Current Schema

CREATE TABLE IF NOT EXISTS lokal_årlig_bedrift_fase_rapport (
                bedrift_id INTEGER REFERENCES bedrift_info(bedrift_id),
                rapportår INTEGER,
                PRIMARY KEY (bedrift_id, rapportår),
                fase VARCHAR(255),
            )
 */


            /* PREFILLING DATA FROM EXSISTING EXCEL */
/* const insertInitialCleanedData = async() =>{
    const dataInsertionArray: QueryResult<any>[] = []
    try{
        for (let company of cleanedData){
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
} */
/* 
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
 */
/* 
const fetchCurrentDataFromProff = async()=>{
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
        fs.writeFileSync("../LocalData/ReferenceBackUp.json", JSON.stringify(referenceArray))
        const orgNrArray = dbReference.data.result.distinct_orgnummer
        const dataArray: ProffQueryReturn[] = []
        const errorArray: unknown[] = []
        for (let nr of orgNrArray){
            await awaitPromise(100)
            console.log(`fetching data for ${nr}`)
            const url = `https://api.proff.no/api/companies/register/NO/${nr}`
            const proffResponse = await fetchApi<ProffQueryReturn>(url)
            if (verifyErrorExists(proffResponse)){
                errorArray.push(proffResponse.error)
            }
            if (verifySuccessQuery(proffResponse)) {
                dataArray.push(proffResponse.data)
            }
        }
        console.log("Backing up proff data")
        fs.writeFileSync("../LocalData/ProffBackUp.json", JSON.stringify(dataArray))
        console.log("Backing up errors")
        fs.writeFileSync("../LocalData/ErrorBackUp.json", JSON.stringify(errorArray))
    }

} */

/**
 * Tar inn resultatet fra proff data query, verifiserer at dataen har det vi vil, og returnerer renset data.
 * Ignorerer også calls hvor Ingen rapporter om økonomi finnes. De vil fremdeles være null i databasen og blir tatt med i avg calls, men bare for årene de er registrert. 
 * @param proffData Query result fra proff data query. 
 * @returns 
 */
/* const cleanProffData = (proffData: any[]) => {
    let cleanedData: ProffQueryReturn[] = []
    for (let data of proffData){
        if (verifyProffData(data)){
            cleanedData.push(data)
        }
    }
    return cleanedData
}

const combineReferenceAndProff = (proffData: any[])=>{
    const cleanedData = cleanProffData(proffData)
    const newData: unifiedData[] = []
    for (let data of cleanedData){
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
} */



/* Gjeldende query:
CREATE TABLE IF NOT EXISTS økonomisk_data (
            rapportår INTEGER,
            ${economicTables}
            bedrift_id INTEGER REFERENCES bedrift_info(bedrift_id),
            PRIMARY KEY (bedrift_id, rapportår)
            )
*/
/* 
const insertInitialProffData = async(proffData: any[])=>{
    const correctedData = combineReferenceAndProff(proffData);
    const errorArray: unknown[] = []
    for (let company of correctedData){
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
                    await db.query(`
                    UPDATE økonomisk_data
                    SET code_${code.code} = $1
                    WHERE rapportår = $2
                    AND bedrift_id = $3
                    `, [Number(code.amount), Number(year.year), company.bedrift_id ])
                }
            }
            console.log("write successfull")
        } catch (error){
            console.log(`It failed, check log.`)
            errorArray.push(error)
        }
    }
    console.log(errorArray)
} */
/* const insertComparisonData = async(dataArray: dataType[]) =>{
    const dbQueryArray = []
    try{
        const userInsertion = await db.query(`
        INSERT INTO comparison_bedrift_info (målbedrift, orgnummer, bransje)
        VALUES ($1, $2, $3)
        RETURNING bedrift_id
        `, [dataArray[0].name, dataArray[0].org_nr, dataArray[0].field])
        dbQueryArray.push(userInsertion)
        const companyId = userInsertion.rows[0].bedrift_id as number
        console.log(companyId)
        for (let dataPoint of dataArray){
            try{
                const faseInsertion = await db.query(`
                INSERT INTO comparison_lokal_årlig_bedrift_fase_rapport(bedrift_id, fase, rapportår)
                VALUES ($1, '${dataPoint.fase}', $2)
                `, [companyId, dataPoint.rapportår])
                const economicInsertion = await db.query(`
                INSERT INTO comparison_økonomisk_data (rapportår, operating_income, operating_profit, result_before_taxes, annual_result, total_assets, bedrift_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [dataPoint.rapportår, dataPoint.operating_income, dataPoint.operating_profit, dataPoint.result_before_taxes, dataPoint.annual_result, dataPoint.total_assets, companyId])
                dbQueryArray.push(economicInsertion)
                dbQueryArray.push(faseInsertion)
            } catch(error){
                dbQueryArray.push(error)
            }
        }
    } catch (error){
        dbQueryArray.push(error)
    }
    return dbQueryArray
}
 */

/* SEARCHBYTAG. Ikke sikker på om beste gjennomføringsmåte. Usikker på om tagname in ANY er for lite spesifikt. Kanskje en inverse tag search, Not In? når brukeren velger en tag, så excluderer searchen alt annet? */


/**
 * Takes in an array of tags. Returns company name, and economic data for each year.
 * Returns all data matching any tags. Very general search. 
 * Adding extra parameters to function allow for spesific queries for spesific numbers.
 * @param tagArray string array containing tags
 * @returns an object {
 * success: boolean,
 * success ? result : error
 * }
 */

/* const searchByTagGeneral = async(tagArray: string[], startYear: number = 0, endYear: number = new Date().getFullYear())=>{
try{
    const data = await db.query(`
    SELECT DISTINCT bedrift_info.målbedrift, økonomisk_data.rapportår, økonomisk_data.operating_income, økonomisk_data.operating_profit, økonomisk_data.result_before_taxes, økonomisk_data.annual_result, økonomisk_data.total_assets
    FROM companytagrelationship
    INNER JOIN bedrift_info 
        ON companytagrelationship.bedrift_id = bedrift_info.bedrift_id
    INNER JOIN økonomisk_data
        ON økonomisk_data.bedrift_id = bedrift_info.bedrift_id
    WHERE companytagrelationship.tagname = ANY($1)
    AND økonomisk_data.rapportår BETWEEN ${startYear} AND ${endYear}
	ORDER BY bedrift_info.målbedrift
    `, [tagArray])
    if (data.rowCount != null && data.rowCount > 0) return {success: true, result: data.rows}
    else return {success: true, result: `No Company Fits Any Of The Tags: ${tagArray.join(", ")}`}
} catch (error){
    return {success: false, error}
}   
} */

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
export const searchByfaseSpesific = async(tagArray: string[], startYear: number= 0, endYear: number = new Date().getFullYear()) => {
    try {
        console.log(tagArray)
        const data = await db.query<queryReturnType>(`
        WITH company_data AS (
            SELECT
                bedrift_info.målbedrift,
                bedrift_info.bedrift_id,
                bedrift_info.bransje,
                bedrift_info.orgnummer,
                lokal_årlig_bedrift_fase_rapport.fase,
                økonomisk_data.rapportår,
                (
                SELECT jsonb_object_agg(split_part(økonomisk_data_kv.key, '_', 2), jsonb_build_object(
                    'description', code_lookup.code_description,
                    'value', økonomisk_data_kv.ed_value
                ))
                    FROM (
                        SELECT key, value::numeric AS ed_value
                        FROM jsonb_each_text(to_jsonb(økonomisk_data.*) - 'bedrift_id' - 'rapportår' )
                        WHERE value IS NOT NULL
                    ) AS økonomisk_data_kv
                    JOIN code_lookup ON code_lookup.economic_code = UPPER(økonomisk_data_kv.key)
                ) AS queried_data
            FROM bedrift_info
            INNER JOIN økonomisk_data ON økonomisk_data.bedrift_id = bedrift_info.bedrift_id
            INNER JOIN lokal_årlig_bedrift_fase_rapport ON lokal_årlig_bedrift_fase_rapport.bedrift_id = bedrift_info.bedrift_id
            AND lokal_årlig_bedrift_fase_rapport.rapportår = økonomisk_data.rapportår
            WHERE 
                lokal_årlig_bedrift_fase_rapport.fase = any($1)
            AND økonomisk_data.rapportår BETWEEN ${startYear} AND ${endYear}
            ORDER BY bedrift_info.målbedrift, økonomisk_data.rapportår
        ), aggregated_data AS (
            SELECT 
                målbedrift,
                bedrift_id,
                bransje,
                orgnummer,
                json_agg(
                    json_build_object(
                        'rapportår', rapportår,
                        'fase', fase,
                        'queried_data', queried_data
                    )
                ) AS data
            FROM
                company_data
            GROUP BY
                målbedrift, bedrift_id, bransje, orgnummer
            ORDER BY
                målbedrift
        )
        SELECT 
            *
        FROM aggregated_data
        `, [tagArray])
        if (data.rowCount != null && data.rowCount > 0) return { success: true, error: null, result: data.rows }
        else return {success: true, error: null, result: `No Company Found Containing The Tags: ${tagArray.join(", ")}`}
    } catch (error) {
        return { success: false, error: error, result: null }
    }
}

export const searchByName = async(companyNameSnippet: string, startYear: number = 0, endYear:number = new Date().getFullYear())=>{
    try{
        const data = await db.query<queryReturnType>(`
            WITH company_data AS (
                SELECT 
                    bedrift_info.målbedrift,
                    bedrift_info.bedrift_id,
                    bedrift_info.bransje,
                    bedrift_info.orgnummer,
                    lokal_årlig_bedrift_fase_rapport.fase,
                    økonomisk_data.rapportår,
                    (
                    SELECT jsonb_object_agg(split_part(økonomisk_data_kv.key, '_', 2), jsonb_build_object(
                        'description', code_lookup.code_description,
                        'value', økonomisk_data_kv.ed_value
                    ))
                        FROM (
                            SELECT key, value::numeric AS ed_value
                            FROM jsonb_each_text(to_jsonb(økonomisk_data.*) - 'bedrift_id' - 'rapportår' )
                            WHERE value IS NOT NULL
                        ) AS økonomisk_data_kv
                        JOIN code_lookup ON code_lookup.economic_code = UPPER(økonomisk_data_kv.key)
                    ) AS queried_data
                FROM bedrift_info
                INNER JOIN økonomisk_data ON økonomisk_data.bedrift_id = bedrift_info.bedrift_id
                INNER JOIN lokal_årlig_bedrift_fase_rapport ON lokal_årlig_bedrift_fase_rapport.bedrift_id = bedrift_info.bedrift_id
                WHERE bedrift_info.målbedrift ILIKE '%' || $1 || '%'
                AND lokal_årlig_bedrift_fase_rapport.rapportår = økonomisk_data.rapportår
                AND økonomisk_data.rapportår BETWEEN ${startYear} AND ${endYear}
                ORDER BY bedrift_info.målbedrift, økonomisk_data.rapportår
            ), aggregated_data AS (
                SELECT
                    målbedrift,
                    bedrift_id,
                    bransje,
                    orgnummer,
                    json_agg(
                        json_build_object(
                            'rapportår', rapportår,
                            'fase', fase,
                            'queried_data', queried_data
                        )
                    ) AS data
                FROM
                    company_data
                GROUP BY
                    målbedrift, bedrift_id, bransje, orgnummer
                ORDER BY
                    målbedrift
            )
            SELECT 
                *
            FROM
                aggregated_data
            `, [companyNameSnippet])
            if (data.rowCount != null && data.rowCount > 0) return {success: true, error: null, result: data.rows}
            else return {success: true, error: null, result: `No Company Found With Name Containing ${companyNameSnippet}`}
    } catch (error){
        return {success: false, error: error, result: null}
    }
}

export const searchByOrgNr = async(companyOrgNr: string, startYear: number = 0, endYear: number = new Date().getFullYear())=>{
    try{
        const data = await db.query<queryReturnType>(`
        WITH company_data AS (
            SELECT
                bedrift_info.målbedrift,
                bedrift_info.bedrift_id,
                bedrift_info.bransje,
                bedrift_info.orgnummer,
                lokal_årlig_bedrift_fase_rapport.fase,
                økonomisk_data.rapportår,
                (
                SELECT jsonb_object_agg(split_part(økonomisk_data_kv.key, '_', 2), jsonb_build_object(
                    'description', code_lookup.code_description,
                    'value', økonomisk_data_kv.ed_value
                ))
                    FROM (
                        SELECT key, value::numeric AS ed_value
                        FROM jsonb_each_text(to_jsonb(økonomisk_data.*) - 'bedrift_id' - 'rapportår' )
                        WHERE value IS NOT NULL
                    ) AS økonomisk_data_kv
                    JOIN code_lookup ON code_lookup.economic_code = UPPER(økonomisk_data_kv.key)
                ) AS queried_data
            FROM bedrift_info
            INNER JOIN økonomisk_data ON økonomisk_data.bedrift_id = bedrift_info.bedrift_id
            INNER JOIN lokal_årlig_bedrift_fase_rapport ON lokal_årlig_bedrift_fase_rapport.bedrift_id = bedrift_info.bedrift_id
            WHERE bedrift_info.orgnummer = $1
            AND lokal_årlig_bedrift_fase_rapport.rapportår = økonomisk_data.rapportår
            AND økonomisk_data.rapportår BETWEEN ${startYear} AND ${endYear}
            ORDER BY bedrift_info.målbedrift, økonomisk_data.rapportår
        ), aggregated_data AS (
                SELECT
                    målbedrift,
                    bedrift_id,
                    bransje,
                    orgnummer,
                    json_agg(
                        json_build_object(
                            'rapportår', rapportår,
                            'fase', fase,
                            'queried_data', queried_data
                        )
                    ) AS data
                FROM
                    company_data
                GROUP BY
                    målbedrift, bedrift_id, bransje, orgnummer
                ORDER BY
                    målbedrift
            )
            SELECT 
                *
            FROM
                aggregated_data
        `, [companyOrgNr])
        if (data.rowCount !== null && data.rowCount > 0 ){
            return {success: true, error: null, result: data.rows}
        } else return {success: true, error: null, result: `No Company Found With The Org Nr: ${companyOrgNr}`}
    } catch (error){
        return {success: false, error: error, result: null}
    }
}


/**
 * funksjon for å hente tagArray for gjeldene bedrift_id
 * @param companyId 
 * @returns array of tags.
 */
export const getTagsFromCompanyId = async(companyId:number) =>{
    try {
        const data = await db.query<tagnameQueryType>(`
        SELECT fase
        FROM lokal_årlig_bedrift_fase_rapport
        WHERE bedrift_id = $1
        `, [companyId])
        return {success: true, error: null, result: data.rows}
    } catch (error) {
        return {success: false, error: error, result: null}
    }
}



/**
 * searchbytag for comparison data.
 * Lager company_data som orginal fase søk, så aggrigerer data i Aggregate_data
 * Som leverer AVG og MEDIAN values for hver bit for hvert år.
 *  
 * )
 * @param tagArray Et array av tags.
 * @returns Array av data av typen dataType
 */
export const searchByComparisonfaseSpesific = async(tagArray: string[], startYear: number= 0, endYear: number = new Date().getFullYear(), keys: string[] = economickeys) => {
    try {
        const columns = await db.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'økonomisk_data'
        AND column_name ILIKE 'code_%'
        `)
        const columnNamesArray: string[] = columns.rows.map(name=>{
            return name.column_name
        })
        const averageValuesArray: any[] = []
        for (let i = startYear; i<=endYear; i++){
            const yearlyObject = {
                year: i,
                fase: tagArray.join(", "),
                averageValues: [] as any[]
            }
            for (let name of columnNamesArray){
                const avgValue = await db.query(`
                    WITH company_data AS (
                        SELECT
                        cl.code_description AS description,
                        od.${name} AS value,
                        od.rapportår
                    FROM
                        økonomisk_data od
                    JOIN
                        lokal_årlig_bedrift_fase_rapport lbf ON od.bedrift_id = lbf.bedrift_id AND od.rapportår = lbf.rapportår
                    JOIN
                        code_lookup cl ON cl.economic_code = UPPER('${name}')
                    WHERE
                        od.rapportår = ${i}
                    AND lbf.fase = ANY($1) 
                    GROUP BY
                        od.rapportår, cl.code_description, od.${name}
                    ), aggregated_data AS (
                        SELECT
                            json_build_object(
                                'description', description,
                                'average_value', AVG(value),
                                'median_value', percentile_cont(0.5) WITHIN GROUP (ORDER BY value),
                                'max_value', MAX(value),
                                'min_value', MIN(value)
                            ) AS ${name.split("_")[1]}
                        FROM
                            company_data
                        WHERE 
                            value IS NOT NULL
                        GROUP BY
                            description
                        ORDER BY
                            description
                    )
                    SELECT 
                        * 
                    FROM
                        aggregated_data
                `, [tagArray])
                if (avgValue.rowCount != null && avgValue.rowCount > 0){
                    yearlyObject.averageValues.push(avgValue.rows[0])
                }
            }
            averageValuesArray.push(yearlyObject)
        }
        console.log(averageValuesArray)
        return {success: true, result: averageValuesArray}
    } catch (error) {
        return { success: false, error: error, result: null }
    }
}

/* 
CREATE OR REPLACE FUNCTION search_by_comparisonfase_specific(
    tag_array text[], 
    start_year int, 
    end_year int
)
RETURNS TABLE(year int, fase text, average_values jsonb) AS $$
DECLARE
    column_name text;
    column_names_array text[];
    yearly_object jsonb;
    result_record RECORD;
BEGIN
    -- Fetch column names that match 'code_%' pattern
    SELECT array_agg(column_name)
    INTO column_names_array
    FROM information_schema.columns
    WHERE table_name = 'økonomisk_data' AND column_name LIKE 'code_%';

    -- Loop over each year range
    FOR year IN start_year..end_year LOOP
        -- Initialize yearly data structure in JSON
        yearly_object := jsonb_build_object('year', year, 'fase', array_to_string(tag_array, ', '), 'averageValues', jsonb_build_array());

        -- Perform the aggregated query for all columns at once using the fetched column names
        FOR result_record IN
            SELECT
                year,
                jsonb_object_agg(column_name, column_data) AS data
            FROM (
                SELECT
                    column_name,
                    jsonb_build_object(
                        'description', (SELECT code_description FROM code_lookup WHERE economic_code = UPPER(column_name)),
                        'average_value', AVG(value),
                        'median_value', percentile_cont(0.5) WITHIN GROUP (ORDER BY value),
                        'max_value', MAX(value),
                        'min_value', MIN(value)
                    ) AS column_data
                FROM
                    økonomisk_data od
                JOIN
                    lokal_årlig_bedrift_fase_rapport lbf ON od.bedrift_id = lbf.bedrift_id AND od.rapportår = year
                WHERE
                    od.rapportår = year
                AND
                    lbf.fase = ANY(tag_array)
                AND
                    column_name = ANY(column_names_array)
                GROUP BY column_name
            ) AS aggregated_data
            GROUP BY year
        LOOP
            -- Update yearly object with new data
            yearly_object := jsonb_set(yearly_object, '{averageValues}', result_record.data);
        END LOOP;

        -- Return yearly data
        RETURN QUERY SELECT year, array_to_string(tag_array, ', '), yearly_object;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
 */


/* const avgValue = await db.query(`
            SELECT
                ${name} AS code,
                cl.code_description AS description,
                AVG(od.${name}) AS value,
                od.rapportår
            FROM
                økonomisk_data od
            JOIN
                lokal_årlig_bedrift_fase_rapport lbf ON od.bedrift_id = lbf.bedrift_id AND od.rapportår = lbf.rapportår
            JOIN
                code_lookup cl ON cl.economic_code = 'CODE_DR'
            WHERE
                od.rapportår BETWEEN ${startYear} AND ${endYear} 
                AND lbf.fase IN ($1) 
            GROUP BY
                od.rapportår, cl.code_description
            ORDER BY
                od.rapportår;
        `, [tagArray]) */



/* TESTING FUNCTIONS */
/* 
 const insertingCompanyNames = await insertInitialCleanedData();

console.log(insertingCompanyNames)
 */

/* 
const fetchedData = await fetchOrgNrFromDb()

console.log(fetchedData) */
/* const searchResults = await searchByfaseSpesific(['preinkubasjon'], 2020, 2024)

console.log(searchResults) 
 */
/* const searchResults = await searchByName("hav")
console.log(searchResults) */

/* const searchResults = await searchByOrgNr(34484040)
console.log(searchResults) */
/* 
const searchResults = await getTagsFromCompanyId(20)
console.log(searchResults) */
/* await fetchCurrentDataFromProff() */

/* 
const combinedData = combineReferenceAndProff(proffData as any[])
console.log(combinedData[10].årsrapporter) */
/* await insertInitialProffData(proffData as any[]); */