
import { useState, createContext, useContext, useEffect, ReactNode } from "react";


export type SearchObject = {
    [key: string]: string
}

type DataSet = {
    year: number,
    companyData: number | string,
    comparisonData?:number
}

type OrgTableType = {
    name: string,
    queriedYears: number[],
    averageQueriedAmount: number,
    index: number
}

type DataContextType = {
    data: any,
    urlParams: SearchObject,
    errorState: boolean,
    dataset: DataSet[] | null,
    currentCompany: string | null,
    currentDescription: string | null,
    queryType: number | null,
    setUrl: (param:SearchObject)=>void,
    setCurrentKey: (param:string)=>void,
    setQueryType: (param:number)=>void,
    setCurrentOrgIndex: (param:number)=>void
    keyAutoCompleteOptionArray: AutocompleteOption
    orgArray: OrgTableType[] | null
    currentOrgIndex: number
}


const initialDataContext = {
    data: null,
    urlParams: {id: ""},
    errorState: false,
    setUrl: ()=>{},
    setCurrentKey: ()=>{},
    setQueryType: ()=>{},
    dataset: [],
    currentDescription: "",
    currentCompany: "",
    keyAutoCompleteOptionArray: [],
    queryType: null,
    orgArray: null,
    setCurrentOrgIndex: ()=>{},
    currentOrgIndex: 0
}
const dataContext = createContext<DataContextType>(initialDataContext);

type ProviderProps = {
    children: ReactNode
}

type AutocompleteOption = {
    label: string,
    id: string
}[]

const getAverageValues = (el:any, currentKey:string) =>{
    if (!el.data[0].queried_data) 
        return [0]
    else if (!el.data[0].queried_data[currentKey])
        return 0
    else return el.data.map((range:any)=>{
        if (!range.queried_data) return 0
        if (!range.queried_data[currentKey]) return 0
        if (!range.queried_data[currentKey].value) return 0
        return range.queried_data[currentKey].value
    }
                    ).reduce((acc:number, curr:number)=>{
                        return acc + curr
                    }, 0)/el.data.length
}

export const DataProvider = ({children}: ProviderProps) =>{
    const [data, setData ] = useState<any>({data: {
        result: null
    }})
    const [ urlParams, setUrl ] = useState<SearchObject>({
        id: "statusQuery"
    })
    const [queryType, setQueryType] = useState<number|null>(null)
    const [currentKey, setCurrentKey] = useState<string>("eka")
    const [dataset, setDataSet] = useState<DataSet[] | null>(null)
    const [currentCompany, setCurrentCompany] = useState<string | null>(null)
    const [currentDescription, setCurrentDescription] = useState<string | null>(null)
    const [errorState, setErrorState] = useState<boolean>(false)
    const [keyAutoCompleteOptionArray, setKeyAutoCompleteOptionArray] = useState<AutocompleteOption>([])
    const [currentOrgIndex, setCurrentOrgIndex] = useState<number>(0)
    const [orgArray, setOrgArray] = useState<OrgTableType[] | null>(null)
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
            const newOrgArray: OrgTableType[] = data.result.data.map((el:any)=>{
                return {
                    name: el.målbedrift,
                    queriedYears: el.data.map((range:any)=>range.rapportår),
                    averageQueriedAmount: getAverageValues(el, currentKey),
                    index: data.result.data.indexOf(el)
                }
            })
            setOrgArray(newOrgArray)
            const currentData = data.result.data[currentOrgIndex]
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
                    companyData: el.queried_data ? el.queried_data[currentKey] ? el.queried_data[currentKey].value ? el.queried_data[currentKey].value : null : null : null
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
    }, [data, currentKey, currentOrgIndex])
    return (
        <dataContext.Provider value={{currentOrgIndex, queryType, setQueryType, data, urlParams, setUrl, setCurrentKey, currentCompany, currentDescription, dataset, keyAutoCompleteOptionArray, errorState, orgArray, setCurrentOrgIndex}}>
            {children}
        </dataContext.Provider>
    )
}

export const useData = () =>{
    return useContext(dataContext)
}