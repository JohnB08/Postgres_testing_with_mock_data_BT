import express from "express"
import cors from "cors"
import { verifiyBaseQuery, verifyNameQueryType, verifyOrgNrQueryType, verifyTagQueryType } from "./db/verifierFuncs/queryVerifier.js"
import { searchByComparisonfaseSpesific, searchByName, searchByOrgNr, searchByfaseSpesific } from "./db/dbfuncs/dbFuncs.js"


const server = express()
const port = 3000

server.use(express.json())
server.use(cors())


/* Veldig uryddig atm. Kanskje query bør være på sitt eget endpoint. Sammen med Login?*/

server.get("/", async (req, res)=>{
    const query = req.query
    const verifyQuery = verifiyBaseQuery(query)
    if (!verifyQuery) return res.status(400).json({
        result:
        {
            message: "Bad Request, missing Query."
        }
    })
    if (query.compareWith && typeof query.compareWith === "string"){
            const compareStringCheck = /^(\p{L}+,)*\p{L}+$/u.test(query.compareWith)
            console.log(compareStringCheck)
            if (!compareStringCheck){
                return res.status(400).json({
                    result: {
                        error: "Bad Request",
                        message: "Could not validate comparison value."
                    }
                })
            }
        }
    if (query.id === "nameQuery"){
        const verifyNameQuery = verifyNameQueryType(query)
        if (!verifyNameQuery) return res.status(400).json({
            result: {
                message: "Bad Request, Could Not Validate Name Snippet."
            }
        })
        const queryNameSnippet = await searchByName(query.nameSnippet, query.from ? Number(query.from) : 2013, query.to ? Number(query.to) : new Date().getFullYear())
        if (queryNameSnippet.success === false && typeof queryNameSnippet.result === null) return res.status(500).json({
            result: {
                error: queryNameSnippet.error,
                message: "Internal Server Error"
            }
        })
        if (query.compareWith){
            const comparisonStatusArray = query.compareWith.split(",").map(el=>{
                return `${el[0].toLocaleUpperCase()}${el.slice(1)}`
            })
            const comparisonData = await searchByComparisonfaseSpesific(comparisonStatusArray, query.from ? Number(query.from) : 2013, query.to ? Number(query.to) : new Date().getFullYear());
            if (comparisonData.success === false && comparisonData.result === null){
                return res.status(500).json({
                    result: {
                        error: comparisonData.error,
                        message: "Internal Server Error."
                    }
                })
            }
            if (comparisonData.success === true && comparisonData.result != null){
                return res.status(200).json({
                    result: {
                        data: queryNameSnippet.result,
                        comparisonData: comparisonData.result
                    }
                })
            }
        } else {
            if (queryNameSnippet.success && queryNameSnippet.result != null){
                return res.status(200).json({
                    result: {
                        data: queryNameSnippet.result
                    }
                })
            }
        }
    }
    if (query.id === "statusQuery"){
        const verifyTagQuery = verifyTagQueryType(query)
        if (!verifyTagQuery) return res.status(400).json({
            result: {
                message: "Bad Request, Could Not Validate Query Tags"
            }
        })
        const queryArray = query.status.split(",")
        const queryTagArray = queryArray.map(el=>{
            return `${el[0].toLocaleUpperCase()}${el.slice(1)}`
        })
        
        const queryTags = await searchByfaseSpesific(queryTagArray, query.from ? Number(query.from) : 2013, query.to ? Number(query.to) : new Date().getFullYear())
        if (queryTags.success === false || queryTags.result === null) return res.status(500).json({
            result: {
                error: queryTags.error,
                message: "Internal Server Error"
            }
        })
        if (queryTags.success === true && typeof queryTags.result === "string") {
            return res.status(200).json({
                result: {
                    data: queryTags.result,
                }
            })
        }
        /* query.compareWith ? await searchByComparisonfaseSpesific(query.compareWith.split(",").map(el=>{
            return `${el[0].toLocaleUpperCase()}${el.slice(1)}`
        }), query.from ? Number(query.from) : 0, query.to ? Number(query.to) : new Date().getFullYear()) : null */
        const comparisonData = query.compareWith ? await searchByComparisonfaseSpesific(query.compareWith.split(",").map(el=>{
            return `${el[0].toLocaleUpperCase()}${el.slice(1)}`
        }), query.from ? Number(query.from) : 2013, query.to ? Number(query.to) : new Date().getFullYear()) : null
        console.log(comparisonData)
        if (comparisonData === null){
            return res.status(200).json({
                result: {
                    data: queryTags.result
                }
            })
        }
        if (comparisonData.success === false || comparisonData.result === null){
            return res.status(500).json({
                result: {
                    error: comparisonData.error,
                    message: "Internal Server Error."
                }
            })
        }
        if (comparisonData.success === true && typeof comparisonData.result === "string"){
            return res.status(200).json({
                result: {
                    data: queryTags.result,
                    comparisonData: "No Comparison Data Found."
                }
            })
        }
        return res.status(200).json({
            result: {
                data: queryTags.result,
                comparisonData: comparisonData.result
            }
        })
    }
    if (query.id === "orgNrQuery"){
        console.log(query)
        const verifyOrgNrQuery = verifyOrgNrQueryType(query)
        if (!verifyOrgNrQuery) return res.status(400).json({
            result: {
                message: "Bad Request, Could Not Validate Organisation Number."
            }
        })
        const queryOrgNr = await searchByOrgNr(query.orgNr, query.from ? Number(query.from) : 2013, query.to ? Number(query.to) : new Date().getFullYear())
        if (queryOrgNr.success === false && queryOrgNr.error !== null) return res.status(500).json({
            result: {
                error: queryOrgNr.error,
                message: "Internal Server Error"
            }
        })
        if (queryOrgNr.success === true && queryOrgNr.result === null || typeof queryOrgNr.result === "string"){
            return res.status(200).json({
                result: {
                    data: queryOrgNr.result,
                    message: `Missing data for ${query.orgNr}`
                }
            })
        }
        if (queryOrgNr.success === true && queryOrgNr.result !== null){
            if (query.compareWith){
                const tags = query.compareWith.split(",").map(el=>{
                    return `${el[0].toLocaleUpperCase()}${el.slice(1)}`
                })
                const comparisonData = await searchByComparisonfaseSpesific(tags, query.from ? Number(query.from) : 2013, query.to ? Number(query.to) : new Date().getFullYear())
                if (comparisonData.success === false && comparisonData.error != null){
                    return res.status(500).json({
                        result: {
                            error: comparisonData.error,
                            message: "Internal Server Error."
                        }
                    })
                }
                console.log(comparisonData.result)
                if (comparisonData.success && comparisonData.result === null || typeof comparisonData.result === "string"){
                    return res.status(200).json({
                        result: {
                            data: queryOrgNr.result,
                            comparisonData: "No Comparison Data Found."
                        }
                    })
                }
                return res.status(200).json({
                    result: {
                        data: queryOrgNr.result,
                        comparisonData: comparisonData.result
                    }
                })
            } else{
                return res.status(200).json({
                    result: {
                        data: queryOrgNr.result
                    }
                })
            }
        }
    }
})

server.listen(port, ()=>{
    console.log(`Server Listening On Port: ${port}`)
})