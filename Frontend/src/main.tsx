import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Context Providers
import { ThemeProvider } from './pages/ThemeContext'
import { LanguageProvider } from './pages/LanguageContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
)