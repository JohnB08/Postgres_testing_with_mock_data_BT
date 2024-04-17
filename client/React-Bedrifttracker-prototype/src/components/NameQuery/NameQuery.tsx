import { Autocomplete, TextField } from "@mui/material"
import { SearchObject, useData } from '../ContextWrapper/ContextWrapper'
import { useState, FormEvent} from 'react'
import { autocompleteOptions2 } from "../../UtilJson/autocompleteHelper"
import style from "./NameQuery.module.css"


export const NameQueryForm = ()=>{

const {data, setUrl } = useData()
  const [inputValue, setInputValue] = useState<SearchObject>({
    id: "statusQuery"
  })
  console.log(data)
  const handleInput = (name: string) =>{
    setInputValue(prev=>{
        return (
            {
                ...prev,
                id: "nameQuery",
                nameSnippet: name
            }
        )
    })
  }

  const handleAddFase = (fase: string)=>{
    console.log(fase)
    setInputValue(prev=>({
      ...prev,
      compareWith: fase
    }))

  }
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setUrl(inputValue)
  }
return (
    <>
      <form className={'mainForm'}>
      <TextField id="text-field-name-query" label="Search for org names" value={inputValue.nameSnippet} onChange={(event)=>handleInput(event.target.value)} />
      <Autocomplete
        disablePortal
        id="auto-test-2"
        options={autocompleteOptions2}
        sx={{width: 400}}
        renderInput={(params) => <TextField {...params} label="Sammenlign med fase."/>}
        onChange={(event, option)=>option === null ? null : handleAddFase(option)}
        />
      <button type='submit' onClick={handleSubmit} className={'subBtn'}>Search</button>
    </form>
    </>
)
}