// src/pages/GroupOptionsPage.jsx
import React, { useState, useEffect, useRef, useContext } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { MemberContext } from '../context/MemberContext'

const COLORS = {
  pageBg: '#05203C',
  cardBg: '#1F2937',
  text: '#FFF',
  accent: '#0362E3',
}

function GroupOptionsPage() {
  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('group')
  const { member } = useContext(MemberContext)
  const shareLink = `${window.location.origin}/group?group=${groupId}`
  const shareInputRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [groupName, setGroupName] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [savingName, setSavingName] = useState(false)

  const [members, setMembers] = useState([])
  const [newMemberName, setNewMemberName] = useState('')
  const [addingMember, setAddingMember] = useState(false)

  useEffect(() => {
    if (!groupId) {
      setError('No group ID provided.')
      setLoading(false)
      return
    }
    fetch(`/api/groups/${groupId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load group')
        return res.json()
      })
      .then(data => {
        setGroupName(data.name)
        setOriginalName(data.name)
        setMembers(data.members)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [groupId])

  const saveGroupName = async () => {
    const trimmed = groupName.trim()
    if (trimmed === originalName.trim()) return
    if (!window.confirm(`Change group name from “${originalName}” to “${trimmed}”?`)) {
      return
    }
    setSavingName(true)
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) throw new Error('Could not update group name')
      setOriginalName(trimmed)
    } catch (err) {
      alert(err.message)
    } finally {
      setSavingName(false)
    }
  }

  const addMember = async () => {
    if (!newMemberName.trim()) return
    setAddingMember(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMemberName.trim() }),
      })
      if (!res.ok) throw new Error('Could not add member')
      const member = await res.json()
      setMembers(m => [...m, member])
      setNewMemberName('')
    } catch (err) {
      alert(err.message)
    } finally {
      setAddingMember(false)
    }
  }

  const renameMember = async (memberId, newName) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) throw new Error('Could not rename member')
    } catch (err) {
      alert(err.message)
    }
  }

  const deleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Delete member “${memberName}”?`)) return
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Could not delete member')
      setMembers(m => m.filter(x => x.id !== memberId))
    } catch (err) {
      alert(err.message)
    }
  }

  const copyLink = () => {
    if (shareInputRef.current) {
      shareInputRef.current.select()
      document.execCommand('copy')
      alert('Link copied to clipboard!')
    }
  }

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

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Edit Group</h2>
        {member && (
          <p style={styles.welcome}>Editing as {member.name}</p>
        )}
        {/* Rename group */}
        <label style={styles.label}>Group Name</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            style={styles.input}
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />
          <button
            style={styles.btn}
            onClick={saveGroupName}
            disabled={
              savingName ||
              !groupName.trim() ||
              groupName.trim() === originalName.trim()
            }
          >
            {savingName ? 'Saving…' : 'Save'}
          </button>
        </div>

        <hr style={styles.divider} />

        {/* Members management */}
        <h3 style={styles.subTitle}>Members</h3>
        <ul style={styles.memberList}>
          {members.map(member => (
            <li key={member.id} style={styles.memberRow}>
              <input
                style={styles.memberInput}
                defaultValue={member.name}
                onBlur={e => {
                  const newName = e.target.value
                  if (newName !== member.name) {
                    renameMember(member.id, newName)
                    setMembers(ms =>
                      ms.map(m =>
                        m.id === member.id ? { ...m, name: newName } : m
                      )
                    )
                  }
                }}
              />
              <button
                style={styles.deleteBtn}
                onClick={() => deleteMember(member.id, member.name)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        {/* Add new member */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            style={styles.input}
            placeholder="New member name"
            value={newMemberName}
            onChange={e => setNewMemberName(e.target.value)}
          />
          <button
            style={styles.btn}
            onClick={addMember}
            disabled={addingMember || !newMemberName.trim()}
          >
            {addingMember ? 'Adding…' : 'Add'}
          </button>
        </div>

        <hr style={styles.divider} />

        {/* Share link */}
        <h3 style={styles.subTitle}>Share this group</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            ref={shareInputRef}
            style={styles.input}
            value={shareLink}
            readOnly
            onClick={copyLink}
          />
          <button style={styles.btn} onClick={copyLink}>Copy</button>
          <button
            style={styles.btn}
            onClick={() =>
              window.open(
                `https://api.whatsapp.com/send?text=${encodeURIComponent(shareLink)}`,
                '_blank'
              )
            }
          >
            WhatsApp
          </button>
          <button
            style={styles.btn}
            onClick={() =>
              window.open(
                `https://www.instagram.com/?url=${encodeURIComponent(shareLink)}`,
                '_blank'
              )
            }
          >
            Instagram
          </button>
        </div>

        <Link to={`/group?group=${groupId}`} style={styles.backLink}>
          ← Back to group view
        </Link>
      </div>
    </div>
  )
}

const styles = {
  page: {
    backgroundColor: COLORS.pageBg,
    minHeight: '100vh',
    color: COLORS.text,
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '16px',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '16px',
  },
  welcome: {
    fontSize: '1rem',
    marginBottom: '16px',
    textAlign: 'center',
    opacity: 0.9,
  },
  label: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '0.9rem',
  },
  input: {
    flex: 1,
    padding: '8px',
    borderRadius: '4px',
    border: `1px solid ${COLORS.accent}`,
    background: COLORS.cardBg,
    color: COLORS.text,
  },
  btn: {
    padding: '8px 12px',
    backgroundColor: COLORS.accent,
    border: 'none',
    borderRadius: '4px',
    color: COLORS.text,
    cursor: 'pointer',
  },
  divider: {
    border: 'none',
    borderTop: `1px solid ${COLORS.cardBg}`,
    margin: '24px 0',
  },
  subTitle: {
    fontSize: '1.2rem',
    marginBottom: '8px',
  },
  memberList: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '16px',
  },
  memberRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '8px',
  },
  memberInput: {
    flex: 1,
    padding: '8px',
    borderRadius: '4px',
    border: `1px solid ${COLORS.accent}`,
    background: COLORS.cardBg,
    color: COLORS.text,
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: COLORS.accent,
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  backLink: {
    display: 'inline-block',
    marginTop: '16px',
    color: COLORS.accent,
    textDecoration: 'none',
  },
  center: {
    padding: '2rem',
    textAlign: 'center',
  },
  link: {
    color: COLORS.accent,
    textDecoration: 'none',
  },
}

export default GroupOptionsPage