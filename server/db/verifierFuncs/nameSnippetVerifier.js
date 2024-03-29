/* Funksjon for å passe på at namesearch er korrekt type. */
export const verifySnippetAsString = (companyNameSnippet) => {
    return (typeof companyNameSnippet === "string" &&
        companyNameSnippet.length > 0);
};
