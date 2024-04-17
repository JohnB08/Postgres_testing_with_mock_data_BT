import { Autocomplete, TextField } from "@mui/material"
import { SearchObject, useData } from '../ContextWrapper/ContextWrapper'
import { useState, FormEvent} from 'react'
import {autocompleteOptions, autocompleteOptions2} from "../../UtilJson/autocompleteHelper"


export const OrgQueryForm = ()=>{

const {data, setUrl, setCurrentKey, keyAutoCompleteOptionArray} = useData()
  const [inputValue, setInputValue] = useState<SearchObject>({
    id: "statusQuery"
  })
  console.log(data)
  const handleInput = (id: number) =>{
    setInputValue(prev=>{
        return (
            {
                ...prev,
                id: "orgNrQuery",
                orgNr: id.toString()
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

  const changeKey = (key: string) =>{
    setCurrentKey(key)
  }
return (
    <>
      <form className="mainForm">
      <Autocomplete
        disablePortal
        id="auto-test-1"
        options={autocompleteOptions}
        sx={{width: 400}}
        renderInput={(params) => <TextField {...params} label="Søk Enkeltbedrift"/>}
        onChange={(event, option)=>option === null ? null : handleInput(option.id)}
        />
      <Autocomplete
        disablePortal
        id="auto-test-2"
        options={autocompleteOptions2}
        sx={{width: 400}}
        renderInput={(params) => <TextField {...params} label="Sammenlign med fase."/>}
        onChange={(event, option)=>option === null ? null : handleAddFase(option)}
        />
      {keyAutoCompleteOptionArray.length > 0 ? <Autocomplete
        disablePortal
        id="auto-test-2"
        options={keyAutoCompleteOptionArray}
        sx={{width: 400}}
        renderInput={(params) => <TextField {...params} label="Velg dataset."/>}
        onChange={(event, option)=>option === null ? null : changeKey(option.id)}
        /> : ""}
      <button className="subBtn" type='submit' onClick={handleSubmit}>Search</button>
    </form>
    </>
)
}