import { Skeleton } from "@mui/material";
import style from "./GraphSkeleton.module.css"

export const GraphSkeleton = () =>{
    return(
        <>
            <div className={style.graphSkeleton}>
                <Skeleton variant="rectangular" height={580} width={20}/>
                <Skeleton variant="rectangular" height={200} width={100}/>
                <Skeleton variant="rectangular" height={450} width={100}/>
                <Skeleton variant="rectangular" height={320} width={100}/>
                <Skeleton variant="rectangular" height={500} width={100}/>
            </div>
            <Skeleton variant="rectangular" height={20} width={600}/>
        </>
    )
}