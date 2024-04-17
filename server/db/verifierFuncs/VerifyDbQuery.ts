export type QueryPackage<T> = {
    success: boolean,
    data: T | string,
    error: undefined
} | {
    success: boolean,
    data: undefined,
    error: unknown
}

export type UnsuccessfulQueryPackage = QueryPackage<any> & {
    success: false,
    data: undefined,
    error: unknown
}
export type SuccessfullQueryPackage<T> = QueryPackage<T> & {
    success: true,
    data: T,
    error: undefined
}



export const verifyErrorExists = <T>(object: QueryPackage<T>): object is UnsuccessfulQueryPackage => {
    return (
        typeof object === "object" &&
        (object as UnsuccessfulQueryPackage).success === false
    )
}

export const verifySuccessQuery = <T>(object: QueryPackage<T>): object is SuccessfullQueryPackage<T> =>{
    return (
        typeof object === "object" &&
        (object as SuccessfullQueryPackage<T>).success === true && 
        typeof (object as SuccessfullQueryPackage<T>).data != "string"
    )
}