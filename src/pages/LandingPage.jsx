// src/pages/LandingPage.jsx
import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { MemberContext } from '../context/MemberContext'

const COLORS = {
  pageBg: '#05203C',
  cardBg: '#1F2937',
  text: '#FFFFFF',
  hover: '#334155',
  accent: '#0362E3',
}

export default function LandingPage() {
  const { member, logout } = useContext(MemberContext)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/groups')
      .then(res => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then(data => {
        // no filter: always show all groups here
        setGroups(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={styles.loading}>Loading groups…</div>
  if (error) return <div style={styles.error}>Error: {error}</div>

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Your Trips</h2>

        {/* Always-visible user section */}
        <div style={styles.userSection}>
          {member ? (
            <>
              <p style={styles.welcome}>Viewing as <strong>{member.name}</strong></p>
              <button style={styles.logoutButton} onClick={logout}>
                Log Out
              </button>
            </>
          ) : (
            <p style={styles.welcome}>
              You’re not logged in. Select yourself when you open a group.
            </p>
          )}
        </div>

        <ul style={styles.list}>
          {groups.map(group => (
            <li key={group.id} style={styles.listItem}>
              <Link to={`/group?group=${group.id}`} style={styles.link}>
                <span style={styles.icon}>🏖️</span>
                <span style={styles.name}>{group.name}</span>
                <span style={styles.count}>({group.members.length})</span>
                <span style={styles.arrow}>›</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const styles = {
  page: {
    backgroundColor: COLORS.pageBg,
    minHeight: '100vh',
    width: '100%',
    color: COLORS.text,
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '16px',
  },
  title: {
    marginBottom: '16px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '16px',
    minHeight: '2.5rem',
  },
  welcome: {
    fontSize: '1rem',
    textAlign: 'center',
    opacity: 0.9,
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: COLORS.accent,
    border: 'none',
    borderRadius: '4px',
    color: COLORS.text,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    backgroundColor: COLORS.cardBg,
    borderRadius: '8px',
    marginBottom: '12px',
    overflow: 'hidden',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    color: COLORS.text,
    textDecoration: 'none',
    transition: 'background-color 0.2s',
  },
  icon: {
    marginRight: '12px',
    fontSize: '1.5rem',
  },
  name: {
    flexGrow: 1,
    fontSize: '1rem',
  },
  count: {
    marginRight: '8px',
    fontSize: '0.9rem',
    opacity: 0.75,
  },
  arrow: {
    fontSize: '1.2rem',
  },
  loading: {
    padding: '24px',
    textAlign: 'center',
    color: COLORS.text,
  },
  error: {
    padding: '24px',
    textAlign: 'center',
    color: 'red',
  },
}
