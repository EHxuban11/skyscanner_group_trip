// src/pages/GroupPage.jsx
import React, { useState, useEffect, useContext } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { MemberContext } from '../context/MemberContext'

const COLORS = {
  pageBg: '#05203C',
  cardBg: '#1F2937',
  text: '#FFF',
  accent: '#0362E3',
  memberBadgeBg: '#1F2937',
  statsBg: '#133B5C',
  recCardBg: '#1A2433',
  recCardBorder: '#2A3A4C',
}

const TOP_PLACES = [
  { name: 'París, Francia', score: 9.5 },
  { name: 'Barcelona, España', score: 9.2 },
  { name: 'Roma, Italia', score: 8.9 },
  { name: 'Tokio, Japón', score: 8.7 },
  { name: 'Nueva York, EE.UU.', score: 8.5 },
]

export default function GroupPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const groupId = searchParams.get('group')
  const { member, setMember, logout } = useContext(MemberContext)

  const [group, setGroup] = useState(null)
  const [questionnaire, setQuestionnaire] = useState(null)
  const [allResponses, setAllResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Clear any previously stored member immediately on mount
  useEffect(() => {
    logout()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!groupId) {
      setError('No group ID provided.')
      setLoading(false)
      return
    }

    // Load group and questionnaires
    fetch(`/api/groups/${groupId}`)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then(groupData => {
        setGroup(groupData)

        // for each member, fetch questionnaire
        return Promise.all(
          groupData.members.map(m =>
            fetch(`/api/groups/${groupId}/members/${m.id}/questionnaire`)
              .then(r => r.ok ? r.json() : null)
          )
        )
      })
      .then(responses => {
        const valid = responses.filter(r => r && r.budget != null)
        setAllResponses(valid)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [groupId, logout])

  const chooseMember = m => {
    setMember({ id: m.id, name: m.name })
    // load this member's questionnaire
    fetch(`/api/groups/${groupId}/members/${m.id}/questionnaire`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setQuestionnaire(data))
      .catch(() => {})
  }

  const hasCompleted = id => allResponses.some(r => r.memberId === id)

  if (loading) {
    return <div style={styles.center}>Loading…</div>
  }
  if (error) {
    return (
      <div style={styles.center}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <Link to="/" style={styles.link}>← Back to all trips</Link>
      </div>
    )
  }

  // Always require member selection first
  if (!member) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h2 style={styles.title}>Who are you?</h2>
          <ul style={styles.memberList}>
            {group.members.map(m => (
              <li key={m.id} style={styles.memberItem}>
                <button
                  style={{
                    ...styles.selectBtn,
                    opacity: hasCompleted(m.id) ? 1 : 0.4,
                    cursor: hasCompleted(m.id) ? 'pointer' : 'default'
                  }}
                  onClick={() => hasCompleted(m.id) && chooseMember(m)}
                >
                  {m.name}
                </button>
              </li>
            ))}
          </ul>
          <Link to="/" style={styles.backLink}>← Back to all trips</Link>
        </div>
      </div>
    )
  }

  // If questionnaire not done, redirect
  if (!questionnaire) {
    navigate(`/questionario?group=${groupId}`, { replace: true })
    return null
  }

  // Compute insights
  const avgBudget = allResponses.length
    ? Math.round(allResponses.reduce((sum, r) => sum + r.budget, 0) / allResponses.length)
    : 0
  const avgLength = allResponses.length
    ? Math.round(allResponses.reduce((sum, r) => sum + r.tripLength, 0) / allResponses.length)
    : 0
  const avgEco = allResponses.length
    ? (allResponses.reduce((sum, r) => sum + r.ecoPriority, 0) / allResponses.length).toFixed(1)
    : 0

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>{group.name}</h2>

        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <h4>Avg. Budget</h4>
            <p>€ {avgBudget}</p>
          </div>
          <div style={styles.statCard}>
            <h4>Avg. Trip Length</h4>
            <p>{avgLength} days</p>
          </div>
          <div style={styles.statCard}>
            <h4>Avg. Eco Priority</h4>
            <p>{avgEco}</p>
          </div>
        </div>

        <div style={styles.recommendations}>
          <h3 style={styles.recTitle}>Top 5 Places to Visit</h3>
          {TOP_PLACES.map((p, i) => (
            <div key={i} style={styles.recCard}>
              <span>{p.name}</span>
              <div style={styles.recRight}>
                <span style={styles.score}>(Score: {p.score})</span>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.memberBadgeContainer}>
          {group.members.map(m => (
            <div key={m.id} style={styles.memberBadge}>
              <span style={styles.memberIcon}>🧑</span>
              <span style={styles.memberName}>{m.name}</span>
            </div>
          ))}
        </div>

        <Link to="/" style={styles.backLink}>← Back to all trips</Link>
      </div>
    </div>
  )
}

const styles = {
  page: { backgroundColor: COLORS.pageBg, minHeight: '100vh', color: COLORS.text, fontFamily: 'Arial, sans-serif' },
  container: { maxWidth: '600px', margin: '0 auto', padding: '16px', textAlign: 'center' },
  title: { fontSize: '1.75rem', marginBottom: '16px' },
  memberList: { listStyle: 'none', padding: 0, marginBottom: '2rem' },
  memberItem: { marginBottom: '12px' },
  selectBtn: { padding: '12px 24px', backgroundColor: COLORS.accent, border: 'none', borderRadius: '4px', color: COLORS.text, fontSize: '1rem' },
  backLink: { color: COLORS.accent, textDecoration: 'none', marginTop: '16px', display: 'inline-block' },
  center: { padding: '2rem', textAlign: 'center' },
  link: { color: COLORS.accent, textDecoration: 'none' },
  statsContainer: { display: 'flex', justifyContent: 'space-around', backgroundColor: COLORS.statsBg, padding: '12px', borderRadius: '8px', marginBottom: '24px' },
  statCard: { flex: 1, padding: '8px', textAlign: 'center' },
  recommendations: { marginBottom: '24px' },
  recTitle: { marginBottom: '12px' },
  recCard: { backgroundColor: COLORS.recCardBg, border: `1px dotted ${COLORS.recCardBorder}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '8px' },
  recRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  score: { color: COLORS.accent },
  memberBadgeContainer: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' },
  memberBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: COLORS.memberBadgeBg, borderRadius: '8px', padding: '8px', minWidth: '80px' },
  memberIcon: { fontSize: '1.5rem', marginBottom: '4px' },
  memberName: { fontSize: '0.9rem', fontWeight: 'bold' },
}

