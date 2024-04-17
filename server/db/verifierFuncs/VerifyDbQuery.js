export const verifyErrorExists = (object) => {
    return (typeof object === "object" &&
        object.success === false);
};
export const verifySuccessQuery = (object) => {
    return (typeof object === "object" &&
        object.success === true &&
        typeof object.data != "string");
};
