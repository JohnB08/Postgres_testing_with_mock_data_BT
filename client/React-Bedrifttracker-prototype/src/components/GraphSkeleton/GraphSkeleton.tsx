import { Skeleton } from "@mui/material";
import style from "./GraphSkeleton.module.css"

export const GraphSkeleton = () =>{
    return(
        <>
            <div className={style.graphSkeleton}>
                <Skeleton variant="rectangular" height={595} width={5}/>
                <Skeleton variant="rectangular" height={200} width={25}/>
                <Skeleton variant="rectangular" height={450} width={25}/>
                <Skeleton variant="rectangular" height={320} width={25}/>
                <Skeleton variant="rectangular" height={500} width={25}/>
                <Skeleton variant="rectangular" height={240} width={25}/>
                <Skeleton variant="rectangular" height={140} width={25}/>
                <Skeleton variant="rectangular" height={550} width={25}/>
                <Skeleton variant="rectangular" height={430} width={25}/>
                <Skeleton variant="rectangular" height={280} width={25}/>
                <Skeleton variant="rectangular" height={40} width={25}/>
                <Skeleton variant="rectangular" height={520} width={25}/>
            </div>
            <Skeleton variant="rectangular" height={5} width={600}/>
        </>
    )
}