import React, { useState, createContext, useContext, useEffect, ReactNode } from "react";

type DataContextType = {
    data: any,
    urlParams: string,
    setUrl: (param:string)=>void
}

const initialDataContext = {
    data: null,
    urlParams: "InitValue",
    setUrl: ()=>{}
}
const dataContext = createContext<DataContextType>(initialDataContext);

type ProviderProps = {
    children: ReactNode
}

export const DataProvider = ({children}: ProviderProps) =>{
    const [data, setData ] = useState<any>(null)
    const [ urlParams, setUrl ] = useState<string>(`?id=orgNrQuery&orgNr=994878271&compareWith=alumni&from=2020&to=2023`)
    useEffect(()=>{
        const fetchFromDataBase = async()=>{
            try{
                const response = await fetch(`http://localhost:3000/${urlParams}`)
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