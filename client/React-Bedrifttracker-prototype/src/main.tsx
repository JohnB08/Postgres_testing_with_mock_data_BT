import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/Hero Section/App'
import { DataProvider } from './components/ContextWrapper/ContextWrapper'
import { CssBaseline } from '@mui/material'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DataProvider>
      <CssBaseline>
        <App />
      </CssBaseline>
    </DataProvider>
  </React.StrictMode>,
)
