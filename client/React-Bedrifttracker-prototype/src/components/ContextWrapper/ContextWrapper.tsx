import { SerializedStyles } from "@emotion/react";
import React, { useState, createContext, useContext, useEffect, ReactNode } from "react";


export type SearchObject = {
    [key: string]: string
}
type DataContextType = {
    data: any,
    urlParams: SearchObject,
    setUrl: (param:SearchObject)=>void
}

const initialDataContext = {
    data: null,
    urlParams: {id: ""},
    setUrl: ()=>{}
}
const dataContext = createContext<DataContextType>(initialDataContext);

type ProviderProps = {
    children: ReactNode
}

export const DataProvider = ({children}: ProviderProps) =>{
    const [data, setData ] = useState<any>(null)
    const [ urlParams, setUrl ] = useState<SearchObject>({
        id: "statusQuery"
    })
    useEffect(()=>{
        const params = new URLSearchParams(urlParams).toString()
        console.log(params)
        const fetchFromDataBase = async()=>{
            try{
                const response = await fetch(`http://localhost:3000/?${params}`)
                const result = await response.json()
                setData(result)
            } catch (error){
                console.log(error)
            }
        }
         fetchFromDataBase();
    }, [urlParams])
    return (
        <dataContext.Provider value={{data, urlParams, setUrl}}>
            {children}
        </dataContext.Provider>
    )
}

export const useData = () =>{
    return useContext(dataContext)
}