/* Passer på at orgnr er et tall, og er innenfor et range. */
export const verifyOrgNrAsNr = (orgNr) => {
    return (typeof orgNr === "number" &&
        orgNr.toString().length >= 8 &&
        orgNr.toString().length < 10);
};
