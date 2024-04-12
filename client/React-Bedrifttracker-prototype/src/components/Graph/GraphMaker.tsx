import { BarChart } from "@mui/x-charts"
import { useData } from "../ContextWrapper/ContextWrapper"
import { useState } from "react"

type dataElement = {
    [key:string]: {
        value: number,
        description: string
    }
}
export const GraphMaker = () => {
    const {data} = useData()
    if (data.result.data){
        
    }
    return (
    )
}