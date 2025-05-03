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
  const groupId = searchParams.get('group')
  const memberId = searchParams.get('member')
  const [memberName, setMemberName] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!groupId || !memberId) {
      setError('Missing group or member ID.')
      return
    }
    fetch(`/api/groups/${groupId}`)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then(groupData => {
        const member = groupData.members.find(m => m.id === memberId)
        if (!member) throw new Error('Member not found.')
        setMemberName(member.name)
      })
      .catch(err => setError(err.message))
  }, [groupId, memberId])

  if (error) {
    return (
      <div style={{ backgroundColor: COLORS.pageBg, minHeight: '100vh', color: 'red', textAlign: 'center', padding: '2rem' }}>
        <p>Error: {error}</p>
        <Link to={`/group?group=${groupId}`} style={{ color: COLORS.accent, textDecoration: 'none' }}>
          ← Back to group
        </Link>
      </div>
    )
  }

  if (!memberName) {
    return (
      <div style={{ backgroundColor: COLORS.pageBg, minHeight: '100vh', color: COLORS.text, textAlign: 'center', padding: '2rem' }}>
        Loading member…
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: COLORS.pageBg, minHeight: '100vh', color: COLORS.text, textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Member Details</h2>
      <p style={{ fontSize: '1.2rem' }}>Name: {memberName}</p>
      <Link to={`/group?group=${groupId}`} style={{ color: COLORS.accent, textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
        ← Back to group
      </Link>
    </div>
  )
}
