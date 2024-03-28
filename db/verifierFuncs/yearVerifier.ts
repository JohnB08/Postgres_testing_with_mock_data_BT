

/* Funksjon for å passe på at årene som kommer inn fra client er gyldige årstall.  */
export const verifyYear = (year: unknown):year is number =>{
    return (
        typeof year === "number" &&
        year >= 0 &&
        year <= new Date().getFullYear()
    )
}