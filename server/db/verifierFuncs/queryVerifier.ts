type queryType = {
    id: "tagQuery" | "nameQuery" | "orgNrQuery"
    to?: number,
    from?: number
}


type tagQueryType = queryType & {
    id: "tagQuery",
    tags: string
}

type nameQueryType = queryType & {
    id: "nameQuery",
    nameSnippet: string,
}

type orgNrQuery = queryType & {
    id: "orgNrQuery",
    orgNr: number,
}

export const verifiyBaseQuery = (query:unknown): query is queryType => {
    return (
        typeof query === "object" &&
        typeof (query as queryType).id === "string"
    )
}

export const verifyTagQueryType = (query: queryType): query is tagQueryType => {
    return (
        typeof (query as tagQueryType).tags === "string"
    )
}

export const verifyNameQueryType = (query: queryType): query is nameQueryType =>{
    return (
        typeof (query as nameQueryType).nameSnippet === "string"
    )
}

export const verifyOrgNrQueryType = (query: queryType): query is orgNrQuery => {
    return (
        typeof (query as orgNrQuery).orgNr === "number"
    )
}