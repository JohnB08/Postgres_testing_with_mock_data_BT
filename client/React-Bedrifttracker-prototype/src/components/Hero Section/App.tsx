
import './App.css'
import { useData } from '../ContextWrapper/ContextWrapper'
import react, { useState, ChangeEvent, FormEvent } from 'react'

function App() {
  const {data, setUrl, urlParams} = useData()
  const [inputValue, setInputValue] = useState<string>("")
  {console.log(data)}
  const handleInput = (event: ChangeEvent<HTMLInputElement>) =>{
    setInputValue(event.target.value)
  }
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setUrl(inputValue)
  }
  
  return (
    <>
    <p>Hello World</p>
    <form>
      <input type='text' defaultValue={""} onChange={handleInput}></input>
      <button type='submit' onClick={handleSubmit}>This is a test button</button>
    </form>
    </>
  )
}

export default App
