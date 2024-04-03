

/* Kanskje gjøre om ID til f.eks hasha uid fra f.eks supabase? EVT lage egen simpel login service. Litt mer arbeid. 
Kan bruke andre måter å skifte mellom querymethods.*/
type queryType = {
    id: "tagQuery" | "nameQuery" | "orgNrQuery"
    to?: string,
    from?: string
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
    orgNr: string,
}

export const verifiyBaseQuery = (query:unknown): query is queryType => {
    return (
        typeof query === "object" &&
        typeof (query as queryType).id === "string"
    )
}

export const verifyTagQueryType = (query: queryType): query is tagQueryType => {
    return (
        typeof (query as tagQueryType).tags === "string" &&
        /^(\p{L}+,)*\p{L}+$/u.test((query as tagQueryType).tags)
    )
}

/* Kanskje lage et eget table i databasen hvor organisasjonsnavnene er blitt strippet for spesialtegn, sånn at de er tryggere å søke rundt. */
export const verifyNameQueryType = (query: queryType): query is nameQueryType =>{
    return (
        typeof (query as nameQueryType).nameSnippet === "string" &&
        (query as nameQueryType).nameSnippet.length > 0
    )
}

export const verifyOrgNrQueryType = (query: queryType): query is orgNrQuery => {
    return (
        typeof (query as orgNrQuery).orgNr === "string" &&
        !Number.isNaN((query as orgNrQuery).orgNr)
    )
}