/**
 * A function to check if a key is indeed a key of an object in typescript. 
 * Typesafe version to use Object.keys()
 * @param object, the object you want to check.
 * @param key, the key you want to check
 * @returns boolean
 */
export const isKey = <T extends object>(object: T, key: PropertyKey): key is keyof T =>{
    return  key in object
}