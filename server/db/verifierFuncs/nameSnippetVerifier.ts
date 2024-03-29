


/* Funksjon for å passe på at namesearch er korrekt type. */
export const verifySnippetAsString = (companyNameSnippet: unknown): companyNameSnippet is string =>{
    return (
        typeof companyNameSnippet === "string" &&
        companyNameSnippet.length > 0
    )
}