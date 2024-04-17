
import { useData } from '../ContextWrapper/ContextWrapper'
import { MenuItem, TextField } from '@mui/material'
import { GraphMaker } from '../Graph/GraphMaker'
import { OrgQueryForm } from '../OrgNrQueryForm/OrgNrQueryForm'
import { NameQueryForm } from '../NameQuery/NameQuery'
import { FaseQueryForm } from '../FaseQuery/FaseQuery'
import { OrgTable } from '../OrgTable/OrgTable'
import style from "./App.module.css"

function App() {
  const {queryType, setQueryType, } = useData()
  const queryMethods = [
    {label: "Query by Name", value: 0},
    {label: "Query by Orgnumber", value: 1},
    {label: "Query by phase", value: 2}
  ]
  return (
    <main className={style.main}>
      <div className={style.dataContainer}>
        <GraphMaker/>
        <OrgTable/>
      </div>
      <div className={style.queryContainer}>
        <TextField
          id='query-type-select'
          select
          label='Select Query Method'
          helperText='Select your query method'
          value={queryType}
          className={style.textField}
          onChange={(event)=>setQueryType(Number(event.target.value))}
        >
          {queryMethods.map(option=>
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          )}
        </TextField>
        {queryType === null ? "" : queryType === 0 ? <NameQueryForm/> : queryType === 1 ? <OrgQueryForm/> : <FaseQueryForm/>}
      </div>
    </main>
  )
}
export default App
