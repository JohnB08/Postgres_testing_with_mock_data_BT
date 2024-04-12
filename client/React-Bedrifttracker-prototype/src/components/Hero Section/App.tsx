
import './App.css'
import { SearchObject, useData } from '../ContextWrapper/ContextWrapper'
import { useState, ChangeEvent, FormEvent, useMemo, SyntheticEvent } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import {autocompleteOptions, autocompleteOptions2} from "../../UtilJson/autocompleteHelper"

function App() {
  const {data, setUrl} = useData()
  const [inputValue, setInputValue] = useState<SearchObject>({
    id: "statusQuery"
  })
  console.log(data)
  const handleInput = (id: number) =>{
    console.log(id)
    setInputValue({
      id: "orgNrQuery",
      orgNr: id.toString()
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
    <p>Hello World</p>
    <form>
      <Autocomplete
        disablePortal
        id="auto-test-1"
        options={autocompleteOptions}
        sx={{width: 300}}
        renderInput={(params) => <TextField {...params} label="Søk Enkeltbedrift"/>}
        onChange={(event, option)=>option === null ? null : handleInput(option.id)}
        />
      <Autocomplete
        disablePortal
        id="auto-test-2"
        options={autocompleteOptions2}
        sx={{width: 300}}
        renderInput={(params) => <TextField {...params} label="Sammenlign med fase."/>}
        onChange={(event, option)=>option === null ? null : handleAddFase(option)}
        />
      <button type='submit' onClick={handleSubmit}>This is a test button</button>
    </form>
    </>
  )
}

export default App
