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
      {/* Nav now only has "Create Group" */}
      <nav style={{ padding: '1rem', background: '#05203C' }}>
        <Link
          to="/create-group"
          style={{ color: '#FFF', textDecoration: 'none' }}
        >
          Create Group
        </Link>
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
