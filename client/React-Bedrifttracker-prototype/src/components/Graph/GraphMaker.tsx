import { BarChart } from "@mui/x-charts"
import { useData } from "../ContextWrapper/ContextWrapper"
import style from "./GraphMaker.module.css"

export const GraphMaker = () => {
    const {dataset, currentCompany, currentDescription, errorState, data} = useData()
    console.log(dataset)
    return (
        <>
        {currentCompany === null  ? "": <p>Showing data for {currentCompany}</p>}
        {currentDescription === null ? "" : <p>showing value {currentDescription}</p>}
        {errorState ? <p className={style.errorMessage}>{data.result.message}</p> : dataset === null ? "Waiting for data." : <BarChart dataset={dataset} xAxis={[{scaleType: "band", dataKey: 'year'}]} series={[{dataKey: 'companyData', label: currentCompany ? currentCompany : ""}, {dataKey: 'comparisonData', label: "Average Values in Database"}]} height={600} width={600}/>}
        </>
    )
}