import React, { useState } from 'react'

export default function RankingCardComponent({
  name,
  score,
  position,
  placeVotes,       // array of { memberId, value }
  members,          // array of { id, name }
  currentMemberId,  // string
  onVote,           // function(place: string, value: boolean)
}) {
  const [isHovered, setIsHovered] = useState(false)

  // Base score‐color fallback
  let scoreColor = '#EF4444'
  if (score >= 9) scoreColor = '#22C55E'
  else if (score >= 8) scoreColor = '#EAB308'

  // Medal mapping for top 3
  const medalMap = { 1: '🥇', 2: '🥈', 3: '🥉' }
  const colorMap = { 1: '#D4AF37', 2: '#C0C0C0', 3: '#CD7F32' }
  const medal       = medalMap[position] || null
  const borderColor = colorMap[position] || scoreColor

  // Current user’s vote
  const currentVote = placeVotes.find(v => v.memberId === currentMemberId)?.value

  // Styles
  const cardStyle = {
    padding: '16px 20px',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #1A2433, #1E2A37)',
    borderLeft: `4px solid ${borderColor}`,
    borderRadius: '12px 12px 8px 8px',
    boxShadow: isHovered
      ? '0 4px 12px rgba(0,0,0,0.3), 0 0 16px rgba(3,98,227,0.4)'
      : '0 2px 8px rgba(0,0,0,0.2), 0 0 12px rgba(3,98,227,0.3)',
    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }

  const leftStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }

  const placeStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#FFF',
  }

  const iconStyle = {
    fontSize: '2rem',
    lineHeight: 1,
    color: borderColor,
  }

  const avatarsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  }

  const avatarStyle = (val) => ({
    fontSize: '1.4rem',
    backgroundColor:
      val == null ? 'rgba(156,163,175,0.2)' :
      val ? 'rgba(34,197,94,0.2)' :
            'rgba(239,68,68,0.2)',
    color:
      val == null ? '#9CA3AF' :
      val ? '#22C55E' :
            '#EF4444',
    borderRadius: '50%',
    padding: '4px',
    opacity: val == null ? 0.6 : 1,
  })

  const voteAndScoreStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  }

  const voteBtnStyle = (val) => ({
    fontSize: '1.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    opacity: currentVote == null ? 0.4 : (currentVote === val ? 1 : 0.4),
    color: val ? '#22C55E' : '#EF4444',
  })

  const scoreStyle = {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: borderColor,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: '4px 8px',
    borderRadius: '999px',
  }

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left: medal/pin + place + avatars */}
      <div style={leftStyle}>
        <div style={placeStyle}>
          {medal
            ? <span style={iconStyle} aria-label={`medal ${position}`}>{medal}</span>
            : <span style={iconStyle} role="img" aria-label="location pin">📍</span>
          }
          <span>{name}</span>
        </div>
        <div style={avatarsStyle}>
          {members.map(m => {
            const v = placeVotes.find(v => v.memberId === m.id)?.value
            return (
              <span
                key={m.id}
                style={avatarStyle(v)}
                role="img"
                aria-label={m.name}
                title={m.name}
              >
                🧑
              </span>
            )
          })}
        </div>
      </div>

      {/* Right: vote buttons + score */}
      <div style={voteAndScoreStyle}>
        <button onClick={() => onVote(name, true)} style={voteBtnStyle(true)}>👍</button>
        <button onClick={() => onVote(name, false)} style={voteBtnStyle(false)}>👎</button>
        <div style={scoreStyle}>Score: {score}</div>
      </div>
    </div>
  )
}
