
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
    currentOrgIndex: number,
    toYear: number,
    fromYear: number,
    setFromYear: (param:number)=>void,
    setToYear: (param:number)=>void,
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
    currentOrgIndex: 0,
    fromYear: 2013,
    toYear: new Date().getFullYear(),
    setToYear: ()=>{},
    setFromYear: ()=>{}
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
    else return Number.parseFloat((el.data.map((range:any)=>{
        if (!range.queried_data) return 0
        if (!range.queried_data[currentKey]) return 0
        if (!range.queried_data[currentKey].value) return 0
        return range.queried_data[currentKey].value
    }
                    ).reduce((acc:number, curr:number)=>{
                        return acc + curr
                    }, 0)/el.data.length).toFixed(4))
}

export const DataProvider = ({children}: ProviderProps) =>{
    const [data, setData ] = useState<any>({data: {
        result: null
    }})
    const [ urlParams, setUrl ] = useState<SearchObject>({
        id: "StartupQuery",
    })
    const [queryType, setQueryType] = useState<number|null>(null)
    const [currentKey, setCurrentKey] = useState<string>("dr")
    const [dataset, setDataSet] = useState<DataSet[] | null>(null)
    const [currentCompany, setCurrentCompany] = useState<string | null>(null)
    const [currentDescription, setCurrentDescription] = useState<string | null>(null)
    const [errorState, setErrorState] = useState<boolean>(false)
    const [keyAutoCompleteOptionArray, setKeyAutoCompleteOptionArray] = useState<AutocompleteOption>([])
    const [currentOrgIndex, setCurrentOrgIndex] = useState<number>(0)
    const [orgArray, setOrgArray] = useState<OrgTableType[] | null>(null)
    const [fromYear, setFromYear] = useState<number>(2013);
    const [toYear, setToYear] = useState<number>(new Date().getFullYear())
    const [inputValue, setInputValue] = useState<SearchObject>({
    id: "statusQuery"
    })
    useEffect(()=>{
        setCurrentOrgIndex(0)
        setErrorState(false)
        setKeyAutoCompleteOptionArray([])
        setCurrentKey("dr")
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
        if (!data.result) return
        if (!data.result.data && !data.result.comparisonData) return
        if (!Array.isArray(data.result.data) && Array.isArray(data.result.comparisonData)){
            const initialDataSet = data.result.comparisonData
            const startValues:DataSet[] = initialDataSet.map((el:any)=>{
                if (Array.isArray(el.averageValues)){
                    const currentKeys: AutocompleteOption = el.averageValues.map((keyObject:any)=>{
                        const key = Object.keys(keyObject)
                        return {
                            label: keyObject[key[0]].description,
                            id: key[0]
                        }
                    })
                    setKeyAutoCompleteOptionArray(currentKeys)
                    const findValue = el.averageValues.find((value:any)=>{
                            return value[currentKey]
                        })
                    setCurrentDescription(findValue[currentKey].description)
                    return {
                        year: el.year ? el.year : new Date().getFullYear(),
                        companyData: findValue ? findValue[currentKey].average_value : 0,
                        comparisonData: 0,
                        }
                    
                    }
                })
                setCurrentCompany(`average across database`)
               return setDataSet(startValues.filter(x=>x!=undefined))
            }
        if (Array.isArray(data.result.data)){
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
        <dataContext.Provider value={{setFromYear, setToYear, toYear, fromYear, currentOrgIndex, queryType, setQueryType, data, urlParams, setUrl, setCurrentKey, currentCompany, currentDescription, dataset, keyAutoCompleteOptionArray, errorState, orgArray, setCurrentOrgIndex}}>
            {children}
        </dataContext.Provider>
    )
}

export const useData = () =>{
    return useContext(dataContext)
}