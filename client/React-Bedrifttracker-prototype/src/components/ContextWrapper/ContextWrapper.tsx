
import { useState, createContext, useContext, useEffect, ReactNode } from "react";


export type SearchObject = {
    [key: string]: string
}
type DataContextType = {
    data: any,
    urlParams: SearchObject,
    errorState: boolean,
    dataset: DataSet[] | null,
    currentCompany: string | null,
    currentDescription: string | null,
    setUrl: (param:SearchObject)=>void,
    setCurrentKey: (param:string)=>void,
    keyAutoCompleteOptionArray: AutocompleteOption
}
type DataSet = {
    year: number,
    companyData: number | string,
    comparisonData?:number
}

const initialDataContext = {
    data: null,
    urlParams: {id: ""},
    errorState: false,
    setUrl: ()=>{},
    setCurrentKey: ()=>{},
    dataset: [],
    currentDescription: "",
    currentCompany: "",
    keyAutoCompleteOptionArray: [],
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
    const [dataset, setDataSet] = useState<DataSet[] | null>(null)
    const [currentCompany, setCurrentCompany] = useState<string | null>(null)
    const [currentDescription, setCurrentDescription] = useState<string | null>(null)
    const [errorState, setErrorState] = useState<boolean>(false)
    const [keyAutoCompleteOptionArray, setKeyAutoCompleteOptionArray] = useState<AutocompleteOption>([])
    useEffect(()=>{
        setErrorState(false)
        setKeyAutoCompleteOptionArray([])
        const params = new URLSearchParams(urlParams).toString()
        console.log(params)
        const fetchFromDataBase = async()=>{
            try{
                const response = await fetch(`http://localhost:3000/?${params}`)
                if(response.status===404){
                    setErrorState(true)
                } 
                const result = await response.json()
                setData(result)
            } catch (error){
                setErrorState(true)
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
            setCurrentDescription(currentData.data[0].queried_data[currentKey].description)
            const currentKeys = Object.keys(currentData.data[0].queried_data)
            currentKeys.forEach(key=>{
                makeAutocomplete.push({
                    label: currentData.data[0].queried_data[key].description,
                    id: key
                })
            })
            setKeyAutoCompleteOptionArray(makeAutocomplete)
            const graphValues:DataSet[] = currentData.data.map((el:any)=>{
                if (!Array.isArray(data.result.comparisonData)){
                    return {
                        year: el.rapportår,
                        companyData: el.queried_data[currentKey]?.value ? el.queried_data[currentKey].value : null
                    }
                }
                const comparisonDataset = data.result.comparisonData
                const values:DataSet = {
                    year: el.rapportår,
                    companyData: el.queried_data[currentKey]?.value ? el.queried_data[currentKey].value : null
                }
                const foundElement = comparisonDataset.find((compEl:any)=>{
                    return compEl.year === el.rapportår
                })
                console.log(foundElement)
                if (foundElement){
                    const foundValue = foundElement.averageValues.find((el:any)=>{
                        return el[currentKey]
                    })
                    if (foundValue){
                        values.comparisonData = foundValue[currentKey]?.average_value ? foundValue[currentKey].average_value : null
                    }
                }   
                return values
            })
            setDataSet(graphValues)
        }
    }
       updateGraphData();
    }, [data, currentKey])
    return (
        <dataContext.Provider value={{data, urlParams, setUrl, setCurrentKey, currentCompany, currentDescription, dataset, keyAutoCompleteOptionArray, errorState}}>
            {children}
        </dataContext.Provider>
    )
}

export const useData = () =>{
    return useContext(dataContext)
}