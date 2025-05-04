// src/pages/CreateGroupPage.jsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const COLORS = {
  pageBg:     '#05203C',
  cardOverlay:'rgba(255, 255, 255, 0.1)',
  text:       '#FFFFFF',
  hover:      '#144679',
  active:     '#0362E3',
}

export default function CreateGroupPage() {
  const [groupName, setGroupName]     = useState('')
  const [memberName, setMemberName]   = useState('')
  const [members, setMembers]         = useState([])
  const [shareLink, setShareLink]     = useState('')
  const [groupId, setGroupId]         = useState(null)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState(null)

  const navigate = useNavigate()

  const handleAddMember = () => {
    const name = memberName.trim()
    if (!name) return
    setMembers(prev => [...prev, name])
    setMemberName('')
  }

  const handleRemoveMember = idx => {
    setMembers(prev => prev.filter((_, i) => i !== idx))
  }

  const handleCreateGroup = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName, members }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to create group')
      }
      const data = await res.json()
      const link = `${window.location.origin}/join?group=${data.id}`
      setShareLink(link)
      setGroupId(data.id)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink)
    alert('Link copied to clipboard!')
  }

  const whatsappShare = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareLink)}`
  const instagramShare = `https://www.instagram.com/?url=${encodeURIComponent(shareLink)}`

  return (
    <div className="create-group-page">
      <style dangerouslySetInnerHTML={{__html: `
        .create-group-page {
          background-color: ${COLORS.pageBg};
          color: ${COLORS.text};
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 16px;
          font-family: Arial, sans-serif;
        }
        .card {
          background-color: ${COLORS.cardOverlay};
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
          max-width: 400px;
          width: 100%;
          text-align: center;
        }
        .card h2 {
          margin: 0 0 16px;
          font-size: 1.5rem;
          font-weight: bold;
        }
        .input-field {
          width: 100%;
          padding: 10px;
          margin: 8px 0 16px;
          border: 1px solid ${COLORS.text};
          border-radius: 4px;
          background: transparent;
          color: ${COLORS.text};
          font-size: 16px;
        }
        .btn {
          width: 100%;
          padding: 12px;
          margin: 8px 0;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s;
          background: transparent;
          border: 1px solid ${COLORS.text};
          color: ${COLORS.text};
        }
        .btn-primary {
          background-color: ${COLORS.active};
          border-color: ${COLORS.active};
          color: ${COLORS.text};
        }
        .btn-primary:hover {
          background-color: ${COLORS.hover};
          border-color: ${COLORS.hover};
        }
        .btn-next {
          background-color: #FFD700;
          border-color: #FFD700;
          color: #05203C;
          font-size: 18px;
          padding: 14px;
          margin-top: 16px;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .member-list {
          list-style: none;
          padding: 0;
          margin: 16px 0;
        }
        .member-item {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          border: 1px solid ${COLORS.text};
          border-radius: 4px;
          margin-bottom: 8px;
        }
        .remove-btn {
          background: none;
          border: none;
          color: ${COLORS.active};
          cursor: pointer;
          font-size: 16px;
        }
        .qr-image {
          width: 200px;
          height: 200px;
          margin: 16px auto;
        }
      `}}/>

      <div className="card">
        {shareLink ? (
          <>
            <h2>Group Created!</h2>
            <p>Scan this QR code to join:</p>
            <img
              className="qr-image"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareLink)}`}
              alt="QR code"
            />
            <textarea
              className="input-field"
              readOnly
              rows={2}
              value={shareLink}
              style={{ resize: 'none' }}
            />
            <button className="btn btn-primary" onClick={handleCopy}>
              Copy Link
            </button>
            <a
              href={whatsappShare}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Share on WhatsApp
            </a>
            <a
              href={instagramShare}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Share on Instagram
            </a>
            <button
              className="btn-next"
              onClick={() => navigate('/')}
            >
              Next &raquo;
            </button>
          </>
        ) : (
          <>
            <h2>Create a New Group</h2>
            <input
              className="input-field"
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
            />
            <input
              className="input-field"
              type="text"
              placeholder="Member name"
              value={memberName}
              onChange={e => setMemberName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddMember()}
            />
            <button
              className="btn"
              onClick={handleAddMember}
              disabled={!memberName.trim()}
            >
              Add Member
            </button>
            {members.length > 0 && (
              <ul className="member-list">
                {members.map((m, i) => (
                  <li key={i} className="member-item">
                    {m}
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveMember(i)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button
              className="btn btn-primary"
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || members.length === 0 || submitting}
            >
              {submitting ? 'Creating…' : 'Create Group'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
