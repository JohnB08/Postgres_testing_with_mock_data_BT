import express from "express";
import { verifiyBaseQuery, verifyNameQueryType, verifyOrgNrQueryType, verifyTagQueryType } from "./db/verifierFuncs/queryVerifier.js";
import { searchByName, searchByOrgNr, searchByTagSpesific } from "./db/dbfuncs/dbFuncs.js";
const server = express();
const port = 3000;
server.use(express.json());
server.get("/", async (req, res) => {
    const query = req.query;
    const verifyQuery = verifiyBaseQuery(query);
    if (!verifyQuery)
        return res.status(400).json({
            error: {
                message: "Bad Request, missing Query."
            }
        });
    if (query.id === "nameQuery") {
        const verifyNameQuery = verifyNameQueryType(query);
        if (!verifyNameQuery)
            return res.status(400).json({
                error: {
                    message: "Bad Request, Could Not Validate Name Snippet."
                }
            });
        const queryNameSnippet = await searchByName(query.nameSnippet, query.from ? query.from : 0, query.to ? query.to : new Date().getFullYear());
        if (queryNameSnippet.success === false && typeof queryNameSnippet.result === null)
            return res.status(500).json({
                error: {
                    error: queryNameSnippet.error,
                    message: "Internal Server Error"
                }
            });
        else
            return res.status(200).json({
                success: {
                    result: queryNameSnippet.result,
                }
            });
    }
    if (query.id === "tagQuery") {
        const verifyTagQuery = verifyTagQueryType(query);
        if (!verifyTagQuery)
            return res.status(400).json({
                error: {
                    message: "Bad Request, Could Not Validate Query Tags"
                }
            });
        const queryTagArray = query.tags.split(",");
        const queryTags = await searchByTagSpesific(queryTagArray, query.from ? query.from : 0, query.to ? query.to : new Date().getFullYear());
        if (queryTags.success === false && typeof queryTags.result === null)
            return res.status(500).json({
                error: {
                    error: queryTags.error,
                    message: "Internal Server Error"
                }
            });
        else
            return res.status(200).json({
                success: {
                    result: queryTags.result,
                }
            });
    }
    if (query.id === "orgNrQuery") {
        const verifyOrgNrQuery = verifyOrgNrQueryType(query);
        if (!verifyOrgNrQuery)
            return res.status(400).json({
                error: {
                    message: "Bad Request, Could Not Validate Organisation Number."
                }
            });
        const queryOrgNr = await searchByOrgNr(query.orgNr, query.from ? query.from : 0, query.to ? query.to : new Date().getFullYear());
        if (queryOrgNr.success === false && typeof queryOrgNr.result === null)
            return res.status(500).json({
                error: {
                    error: queryOrgNr.error,
                    message: "Internal Server Error"
                }
            });
        else
            return res.status(200).json({
                success: {
                    result: queryOrgNr.result,
                }
            });
    }
});
server.listen(port, () => {
    console.log(`Server Listening On Port: ${port}`);
});
