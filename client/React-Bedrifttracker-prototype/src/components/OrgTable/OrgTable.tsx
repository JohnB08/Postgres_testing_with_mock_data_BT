import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { useData } from "../ContextWrapper/ContextWrapper";


export const OrgTable = () =>{
    const columns: GridColDef[] = [
        {field: 'col1', headerName: 'Name', width: 300},
        {field: 'col2', headerName: 'Available years', width:300},
        {field: 'col3', headerName: 'Average Amount', width: 300}
    ]
    const {orgArray, setCurrentOrgIndex} = useData()
    const rows: GridRowsProp | null = orgArray ? orgArray.sort((a,b)=>{
        if (a.averageQueriedAmount < b.averageQueriedAmount)
            return -1
        else if (a.averageQueriedAmount > b.averageQueriedAmount)
            return +1
        else return 0
    }).map((el)=>{
        return {
            id: el.index,
            col1: el.name,
            col2: el.queriedYears.join(", "),
            col3: el.averageQueriedAmount
        }
    }) : null
    return (
        <>
        {
            rows ?
            <DataGrid 
                rows={rows} 
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {
                            page: 0, pageSize: 5
                        }
                    }
                }}
                pageSizeOptions={[5,10]}
                disableMultipleRowSelection
                onRowClick={(event)=>setCurrentOrgIndex(Number(event.id))}
            />
            : ""
        }
        </>
    )
}