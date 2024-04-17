import { Autocomplete, TextField } from "@mui/material"
import { SearchObject, useData } from '../ContextWrapper/ContextWrapper'
import { useState, FormEvent} from 'react'
import {autocompleteOptions2} from "../../UtilJson/autocompleteHelper"


export const FaseQueryForm = ()=>{

const {data, setUrl } = useData()
  const [inputValue, setInputValue] = useState<SearchObject>({
    id: "statusQuery"
  })
  console.log(data)
  const handleInput = (fase: string) =>{
    setInputValue(prev=>{
        return (
            {
                ...prev,
                id: "statusQuery",
                status: fase
            }
        )
    })
    console.log(inputValue)
  }

  const handleAddFase = (fase: string)=>{
    console.log(fase)
    setInputValue(prev=>({
      ...prev,
      compareWith: fase
    }))
    console.log(inputValue)
  }
  
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setUrl(inputValue)
  }
return (
    <>
      <form className="mainForm">
      <Autocomplete
        disablePortal
        id="auto-test-1"
        options={autocompleteOptions2}
        sx={{width: 400}}
        renderInput={(params) => <TextField {...params} label="Søk i fase."/>}
        onChange={(event, option)=>option === null ? null : handleInput(option)}
        />
      <Autocomplete
        disablePortal
        id="auto-test-2"
        options={autocompleteOptions2}
        sx={{width: 400}}
        renderInput={(params) => <TextField {...params} label="Sammenlign med fase."/>}
        onChange={(event, option)=>option === null ? null : handleAddFase(option)}
        />
      <button className="subBtn" type='submit' onClick={handleSubmit}>Search</button>
    </form>
    </>
)
}