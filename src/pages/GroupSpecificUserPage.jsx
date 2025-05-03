// src/pages/GroupSpecificUserPage.jsx
import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

const COLORS = {
  pageBg: '#05203C',
  text: '#FFF',
  accent: '#0362E3',
}

export default function GroupSpecificUserPage() {
  const [searchParams] = useSearchParams()
  const groupId  = searchParams.get('group')
  const memberId = searchParams.get('member')

  const [memberName, setMemberName] = useState('')
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!groupId || !memberId) {
      setError('Missing group or member ID.')
      return
    }
    fetch(`/api/groups/${groupId}`)
      .then(r => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json()
      })
      .then(data => {
        const m = data.members.find(x => x.id === memberId)
        if (!m) throw new Error('Member not found.')
        setMemberName(m.name)
      })
      .catch(e => setError(e.message))
  }, [groupId, memberId])

  if (error) {
    return (
      <div style={pageStyles.wrapper}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <Link to={`/group?group=${groupId}`} style={pageStyles.backLink}>
          ← Back to group
        </Link>
      </div>
    )
  }

  if (!memberName) {
    return (
      <div style={pageStyles.wrapper}>
        <p>Loading member…</p>
      </div>
    )
  }

  return (
    <div style={pageStyles.wrapper}>
      <h2>Details for {memberName}</h2>
      {/* TODO: render any per-user stats here */}
      <Link to={`/group?group=${groupId}`} style={pageStyles.backLink}>
        ← Back to group
      </Link>
    </div>
  )
}

const pageStyles = {
  wrapper:  {
    background: COLORS.pageBg, minHeight: '100vh',
    color: COLORS.text, display: 'flex',
    flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: 24,
  },
  backLink: {
    marginTop: 16, color: COLORS.accent, textDecoration: 'none'
  },
}
