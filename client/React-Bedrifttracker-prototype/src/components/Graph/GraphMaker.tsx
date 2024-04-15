import { BarChart } from "@mui/x-charts"
import { useData } from "../ContextWrapper/ContextWrapper"

export const GraphMaker = () => {
    const {dataset, currentCompany, currentDescription} = useData()
    console.log(dataset)
    return (
        <>
        <p>Showing data for {currentCompany}</p>
        <p>showing value {currentDescription}</p>
        {dataset === null ? "Waiting for data." : <BarChart dataset={dataset} xAxis={[{scaleType: "band", dataKey: 'x'}]} series={[{dataKey: 'y'}]} height={400} width={400}/>}
        </>
    )
}