
import { useState, createContext, useContext, useEffect, ReactNode } from "react";


export type SearchObject = {
    [key: string]: string
}
type DataContextType = {
    data: any,
    urlParams: SearchObject,
    dataset: DataSet | null,
    currentCompany: string,
    currentDescription: string,
    setUrl: (param:SearchObject)=>void,
    setCurrentKey: (param:string)=>void,
    keyAutoCompleteOptionArray: AutocompleteOption
}
type DataSet = {
    x: number,
    y: number
}[]

const initialDataContext = {
    data: null,
    urlParams: {id: ""},
    setUrl: ()=>{},
    setCurrentKey: ()=>{},
    dataset: [],
    currentDescription: "",
    currentCompany: "",
    keyAutoCompleteOptionArray: []
}
const dataContext = createContext<DataContextType>(initialDataContext);

type ProviderProps = {
    children: ReactNode
}

type AutocompleteOption = {
    label: string,
    id: string
}[]

export const DataProvider = ({children}: ProviderProps) =>{
    const [data, setData ] = useState<any>({data: {
        result: null
    }})
    const [ urlParams, setUrl ] = useState<SearchObject>({
        id: "statusQuery"
    })
    const [currentKey, setCurrentKey] = useState<string>("eka")
    const [dataset, setDataSet] = useState<DataSet| null>(null)
    const [currentCompany, setCurrentCompany] = useState<string>("")
    const [currentDescription, setCurrentDescription] = useState<string>("")
    const [keyAutoCompleteOptionArray, setKeyAutoCompleteOptionArray] = useState<AutocompleteOption>([])
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
    useEffect(()=>{
       const updateGraphData = () =>{
        if (data.result != null && Array.isArray(data.result.data)){
            const currentData = data.result.data[0]
            setCurrentCompany(currentData.målbedrift)
            const makeAutocomplete: AutocompleteOption = []
            const currentKeys = Object.keys(currentData.data[0].queried_data)
            currentKeys.forEach(key=>{
                makeAutocomplete.push({
                    label: currentData.data[0].queried_data[key].description,
                    id: key
                })
            })
            setKeyAutoCompleteOptionArray(makeAutocomplete)
            const graphValues:DataSet = currentData.data.map((el:any)=>{
                setCurrentDescription(el.queried_data[currentKey].description)
                return {
                    x: el.rapportår,
                    y: el.queried_data[currentKey].value
                }
            })
            setDataSet(graphValues)
        }
    }
       updateGraphData();
    }, [data, currentKey])
    return (
        <dataContext.Provider value={{data, urlParams, setUrl, setCurrentKey, currentCompany, currentDescription, dataset, keyAutoCompleteOptionArray}}>
            {children}
        </dataContext.Provider>
    )
}

export const useData = () =>{
    return useContext(dataContext)
}