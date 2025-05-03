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
  const { member, setMember, logout } = useContext(MemberContext)

  // — Login state —
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [errorUsers, setErrorUsers] = useState(null)

  // — Groups state —
  const [groups, setGroups] = useState([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [errorGroups, setErrorGroups] = useState(null)

  // 1️⃣ If no member, fetch all users for login
  useEffect(() => {
    if (!member) {
      setLoadingUsers(true)
      fetch('/api/users')
        .then(r => {
          if (!r.ok) throw new Error(r.statusText)
          return r.json()
        })
        .then(setUsers)
        .catch(err => setErrorUsers(err.message))
        .finally(() => setLoadingUsers(false))
    }
  }, [member])

  // 2️⃣ Once you have a member, fetch *only* their groups
  useEffect(() => {
    if (member) {
      setLoadingGroups(true)
      fetch(`/api/groups?memberId=${member.id}`)
        .then(r => {
          if (!r.ok) throw new Error(r.statusText)
          return r.json()
        })
        .then(setGroups)
        .catch(err => setErrorGroups(err.message))
        .finally(() => setLoadingGroups(false))
    }
  }, [member])

  // ← Login UI
  if (!member) {
    if (loadingUsers) return <div style={styles.loading}>Loading users…</div>
    if (errorUsers)  return <div style={styles.error}>Error: {errorUsers}</div>

    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h2 style={styles.title}>Who’s logging in?</h2>
          <ul style={styles.list}>
            {users.map(u => (
              <li key={u.id} style={styles.listItem}>
                <button
                  style={styles.loginButton}
                  onClick={() => setMember(u)}
                >
                  {u.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  // ← Groups UI
  if (loadingGroups) return <div style={styles.loading}>Loading groups…</div>
  if (errorGroups)  return <div style={styles.error}>Error: {errorGroups}</div>

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Your Trips</h2>

        <div style={styles.userSection}>
          <p style={styles.welcome}>
            Viewing as <strong>{member.name}</strong>
          </p>
          <button style={styles.logoutButton} onClick={logout}>
            Log Out
          </button>
        </div>

        <ul style={styles.list}>
          {groups.map(g => (
            <li key={g.id} style={styles.listItem}>
              <Link to={`/group?group=${g.id}`} style={styles.link}>
                <span style={styles.icon}>🏖️</span>
                <span style={styles.name}>{g.name}</span>
                <span style={styles.count}>({g.members.length})</span>
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
  loginButton: {
    width: '100%',
    padding: '12px',
    margin: '8px 0',
    backgroundColor: COLORS.cardBg,
    border: '1px solid #444',
    borderRadius: '4px',
    color: COLORS.text,
    fontSize: '1rem',
    cursor: 'pointer',
    textAlign: 'left',
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
  listItem: { overflow: 'hidden' },
  link: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    color: COLORS.text,
    textDecoration: 'none',
    transition: 'background-color 0.2s',
  },
  icon: { marginRight: '12px', fontSize: '1.5rem' },
  name: { flexGrow: 1, fontSize: '1rem' },
  count: { marginRight: '8px', fontSize: '0.9rem', opacity: 0.75 },
  arrow: { fontSize: '1.2rem' },
  loading: { padding: '24px', textAlign: 'center', color: COLORS.text },
  error: { padding: '24px', textAlign: 'center', color: 'red' },
}
