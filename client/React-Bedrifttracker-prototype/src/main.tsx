import React from 'react'
import ReactDOM from 'react-dom/client'
import { Header } from './components/Header/Header'
import App from './components/Hero Section/App'
import { DataProvider } from './components/ContextWrapper/ContextWrapper'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DataProvider>
      <Header/>
      <App />
    </DataProvider>
  </React.StrictMode>,
)
