// src/index.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MemberProvider } from './context/MemberContext.jsx'  // ← added .jsx
import App from './App.jsx'                                    // ← ensure extension here too
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <MemberProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </MemberProvider>
)
