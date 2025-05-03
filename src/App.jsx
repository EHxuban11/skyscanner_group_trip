// src/App.jsx
import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import CreateGroupPage from './pages/CreateGroupPage.jsx'
import QuestionnairePage from './pages/QuestionnairePage.jsx'
import GroupPage from './pages/GroupPage.jsx'
import GroupOptionsPage from './pages/GroupOptionsPage.jsx'
import CardsSwipePage from './pages/CardsSwipePage.jsx'
import GroupSpecificUserPage from './pages/GroupSpecificUserPage.jsx'

function TestPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then(setData)
      .catch(setError)
  }, [])

  if (error) {
    return (
      <div style={{ padding: '2rem', color: '#FFF', textAlign: 'center' }}>
        Error: {error.message}
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', color: '#FFF', textAlign: 'center' }}>
      {data ? `API says: ${data.message}` : 'Loading...'}
    </div>
  )
}

export default function App() {
  return (
    <div className="App">
      <nav style={{ padding: '1rem', background: '#05203C', color: '#FFF', display: 'flex', gap: '1rem' }}>
        <Link to="/" style={{ color: '#FFF', textDecoration: 'none' }}>All Groups</Link>
        <Link to="/create-group" style={{ color: '#FFF', textDecoration: 'none' }}>Create Group</Link>
        <Link to="/questionario" style={{ color: '#FFF', textDecoration: 'none' }}>Cuestionario</Link>
        <Link to="/explorar" style={{ color: '#FFF', textDecoration: 'none' }}>Explorar</Link>
        <Link to="/test" style={{ color: '#FFF', textDecoration: 'none' }}>Test API</Link>
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create-group" element={<CreateGroupPage />} />
        <Route path="/questionario" element={<QuestionnairePage />} />
        <Route path="/group" element={<GroupPage />} />
        <Route path="/group/user" element={<GroupSpecificUserPage />} />
        <Route path="/group/options" element={<GroupOptionsPage />} />
        <Route path="/explorar" element={<CardsSwipePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
