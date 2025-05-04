// src/pages/LandingPage.jsx

import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

  const [users, setUsers]               = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [errorUsers, setErrorUsers]     = useState(null)

  const [groups, setGroups]             = useState([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [errorGroups, setErrorGroups]   = useState(null)

  // Fetch users if not logged in
  useEffect(() => {
    if (!member) {
      setLoadingUsers(true)
      fetch('/api/users')
        .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() })
        .then(setUsers)
        .catch(err => setErrorUsers(err.message))
        .finally(() => setLoadingUsers(false))
    }
  }, [member])

  // Fetch groups once logged in
  useEffect(() => {
    if (member) {
      setLoadingGroups(true)
      fetch(`/api/groups?memberId=${member.id}`)
        .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() })
        .then(setGroups)
        .catch(err => setErrorGroups(err.message))
        .finally(() => setLoadingGroups(false))
    }
  }, [member])

  // Not logged in: show login or create prompt
  if (!member) {
    if (loadingUsers) return <div style={styles.loading}>Loading users…</div>
    if (errorUsers)  return <div style={styles.error}>Error: {errorUsers}</div>

    return (
      <div style={styles.page}>
        <div style={styles.container}>
          {users.length > 0 ? (
            <>
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
            </>
          ) : (
            <h2 style={styles.title}>Welcome! Create a group to invite your friends.</h2>
          )}
        </div>
        <button
          style={styles.plusButton}
          onClick={() => navigate('/create-group')}
        >＋</button>
      </div>
    )
  }

  // Logged in but loading/failure
  if (loadingGroups) return <div style={styles.loading}>Loading groups…</div>
  if (errorGroups)  return <div style={styles.error}>Error: {errorGroups}</div>

  // Logged in: show group cards
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Your Trips</h2>
        <div style={styles.userSection}>
          <p style={styles.welcome}>Viewing as <strong>{member.name}</strong></p>
          <button style={styles.logoutButton} onClick={logout}>Log Out</button>
        </div>
        <div style={styles.cardsContainer}>
          {groups.map(g => (
            <div
              key={g.id}
              style={styles.groupCard}
              onClick={() => navigate(`/group?group=${g.id}`)}
            >
              <div style={styles.cardLeft}>
                <span style={styles.icon}>🏖️</span>
                <span style={styles.groupName}>{g.name}</span>
              </div>
              <div style={styles.cardRight}>
                <span style={styles.count}>({g.members.length})</span>
                <span style={styles.arrow}>›</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        style={styles.plusButton}
        onClick={() => navigate('/create-group')}
      >＋</button>
    </div>
  )
}

const styles = {
  page: {
    backgroundColor: COLORS.pageBg,
    minHeight: '100vh',
    color: COLORS.text,
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '16px',
    textAlign: 'center',
  },
  title: {
    marginBottom: '16px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 24px',
  },
  listItem: {
    marginBottom: '8px',
  },
  loginButton: {
    width: '100%',
    padding: '12px',
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
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  welcome: {
    margin: 0,
    fontSize: '1rem',
    opacity: 0.9,
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: COLORS.accent,
    border: 'none',
    borderRadius: '4px',
    color: COLORS.text,
    cursor: 'pointer',
  },
  cardsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },
  groupCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  cardLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  cardRight: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '12px',
    fontSize: '1.5rem',
  },
  groupName: {
    fontSize: '1rem',
    fontWeight: '500',
  },
  count: {
    marginRight: '8px',
    opacity: 0.75,
  },
  arrow: {
    fontSize: '1.2rem',
  },
  plusButton: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: COLORS.accent,
    color: COLORS.text,
    fontSize: '2rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    lineHeight: 0.9,
    zIndex: 1000,
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
