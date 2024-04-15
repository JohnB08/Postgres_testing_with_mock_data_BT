import { Autocomplete, TextField } from "@mui/material"
import { SearchObject, useData } from '../ContextWrapper/ContextWrapper'
import { useState, FormEvent} from 'react'
import { autocompleteOptions2 } from "../../UtilJson/autocompleteHelper"


export const OrgQueryForm = ()=>{

const {data, setUrl, setCurrentKey, keyAutoCompleteOptionArray} = useData()
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
      compareWith: prev.compareWith.includes(fase) ? prev.compareWith : `${prev.compareWith}, ${fase}`
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
      <form>
      <TextField id="text-field-name-query" label="Search for org names" value={inputValue.nameSnippet} onChange={(event)=>handleInput(event.target.value)}/>
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
    </>
)
}