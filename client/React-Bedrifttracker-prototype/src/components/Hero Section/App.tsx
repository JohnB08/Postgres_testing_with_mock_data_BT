
import './App.css'
import { SearchObject, useData } from '../ContextWrapper/ContextWrapper'
import { useState, FormEvent} from 'react'
import { Autocomplete, TextField } from '@mui/material'
import {autocompleteOptions, autocompleteOptions2} from "../../UtilJson/autocompleteHelper"
import { GraphMaker } from '../Graph/GraphMaker'

function App() {
  const {data, setUrl, setCurrentKey, keyAutoCompleteOptionArray} = useData()
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

  const changeKey = (key: string) =>{
    setCurrentKey(key)
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
      {keyAutoCompleteOptionArray.length > 0 ? <Autocomplete
        disablePortal
        id="auto-test-2"
        options={keyAutoCompleteOptionArray}
        sx={{width: 300}}
        renderInput={(params) => <TextField {...params} label="Velg dataset."/>}
        onChange={(event, option)=>option === null ? null : changeKey(option.id)}
        /> : ""}
      <button type='submit' onClick={handleSubmit}>This is a test button</button>
    </form>
    <GraphMaker/>
    </>
  )
}

export default App
