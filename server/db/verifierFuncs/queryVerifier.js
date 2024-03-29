export const verifiyBaseQuery = (query) => {
    return (typeof query === "object" &&
        typeof query.id === "string");
};
export const verifyTagQueryType = (query) => {
    return (typeof query.tags === "string");
};
export const verifyNameQueryType = (query) => {
    return (typeof query.nameSnippet === "string");
};
export const verifyOrgNrQueryType = (query) => {
    return (typeof query.orgNr === "number");
};
