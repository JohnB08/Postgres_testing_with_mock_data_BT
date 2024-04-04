export const verifiyBaseQuery = (query) => {
    return (typeof query === "object" &&
        typeof query.id === "string");
};
export const verifyTagQueryType = (query) => {
    return (typeof query.status === "string" &&
        /^(\p{L}+,)*\p{L}+$/u.test(query.status));
};
/* Kanskje lage et eget table i databasen hvor organisasjonsnavnene er blitt strippet for spesialtegn, sånn at de er tryggere å søke rundt. */
export const verifyNameQueryType = (query) => {
    return (typeof query.nameSnippet === "string" &&
        query.nameSnippet.length > 0);
};
export const verifyOrgNrQueryType = (query) => {
    return (typeof query.orgNr === "string" &&
        !Number.isNaN(query.orgNr));
};
