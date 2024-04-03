export const verifiyBaseQuery = (query) => {
    return (typeof query === "object" &&
        typeof query.id === "string");
};
export const verifyTagQueryType = (query) => {
    return (typeof query.tags === "string" &&
        /^(\p{L}+,)*\p{L}+$/u.test(query.tags));
};
export const verifyNameQueryType = (query) => {
    return (typeof query.nameSnippet === "string");
};
export const verifyOrgNrQueryType = (query) => {
    return (typeof query.orgNr === "string" &&
        !Number.isNaN(query.orgNr));
};
