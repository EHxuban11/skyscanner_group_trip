// src/pages/GroupPage.jsx

import React, { useState, useEffect, useContext } from 'react'
import {
  useSearchParams,
  Link,
  Navigate,
  useLocation,
} from 'react-router-dom'
import Confetti from 'react-confetti'
import { MemberContext } from '../context/MemberContext'
import RankingCardComponent from '../components/RankingCardComponent.jsx'

const COLORS = {
  pageBg:  '#05203C',
  cardBg:  '#1F2937',
  text:    '#FFF',
  accent:  '#0362E3',
  statsBg: '#133B5C',
}

export default function GroupPage() {
  const [searchParams]        = useSearchParams()
  const groupId               = searchParams.get('group')
  const { member, setMember } = useContext(MemberContext)
  const location              = useLocation()

  const [group, setGroup]           = useState(null)
  const [responses, setResponses]   = useState([])
  const [rounds, setRounds]         = useState([])
  const [round, setRound]           = useState(null)
  const [roundVotes, setRoundVotes] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [winner, setWinner]         = useState(null)

  useEffect(() => {
    if (!groupId) {
      setError('No group ID provided.')
      setLoading(false)
      return
    }

    fetch(`/api/groups/${groupId}`)
      .then(r => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json()
      })
      .then(data => {
        setGroup(data)
        return Promise.all(
          data.members.map(m =>
            fetch(
              `/api/groups/${groupId}/members/${m.id}/questionnaire`
            )
              .then(r => {
                if (r.status === 204) return null
                if (!r.ok) {
                  console.warn(
                    `Warning: questionnaire ${m.id} status ${r.status}`
                  )
                  return null
                }
                return r.json()
              })
              .catch(() => null)
          )
        )
      })
      .then(resps => {
        setResponses(resps.filter(r => r && r.budget != null))
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [groupId])

  const totalMembers   = group?.members.length || 0
  const completedCount = responses.length
  const allDone        = totalMembers > 0 && completedCount === totalMembers

  useEffect(() => {
    if (!group || !allDone) return

    fetch(`/api/groups/${group.id}/rounds`)
      .then(r => r.json())
      .then(all => {
        setRounds(all)
        const open = all.find(r => r.status === 'OPEN')
        if (open) return open
        return fetch(
          `/api/groups/${group.id}/rounds`,
          { method: 'POST' }
        ).then(r => r.json())
      })
      .then(setRound)
      .catch(console.error)
  }, [group, allDone])

  useEffect(() => {
    if (!round) return
    fetch(
      `/api/groups/${group.id}/rounds/${round.id}/votes`
    )
      .then(r => r.json())
      .then(setRoundVotes)
      .catch(() => {})
  }, [round])

  useEffect(() => {
    if (!group || !roundVotes.length || winner) return

    const PLACES = [
      'París, Francia',
      'Barcelona, España',
      'Roma, Italia',
      'Tokio, Japón',
      'Nueva York, EE.UU.',
    ]

    for (let place of PLACES) {
      const unanimous = group.members.every(m =>
        roundVotes.some(
          v =>
            v.place === place &&
            v.memberId === m.id &&
            v.value === true
        )
      )
      if (unanimous) {
        setWinner(place)
        return
      }
    }
  }, [roundVotes, group, winner])

  const castVote = async (place, value) => {
    if (!member || !round) return
    const res = await fetch(
      `/api/groups/${groupId}/rounds/${round.id}/vote`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          place,
          value,
        }),
      }
    )
    if (res.ok) {
      const updated = await res.json()
      setRoundVotes(rv =>
        rv
          .filter(
            x =>
              !(
                x.place === place &&
                x.memberId === member.id
              )
          )
          .concat(updated)
      )
    }
  }

  if (loading) {
    return <div style={styles.center}>Loading…</div>
  }
  if (error) {
    return (
      <div style={styles.center}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <Link to="/" style={styles.backLink}>
          ← Back to all trips
        </Link>
      </div>
    )
  }
  if (!member) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h2 style={styles.title}>{group.name}</h2>
          <h3 style={styles.subtitle}>Who are you?</h3>
          <ul style={styles.memberList}>
            {group.members.map(m => (
              <li key={m.id} style={styles.memberItem}>
                <button
                  style={styles.selectBtn}
                  onClick={() =>
                    setMember({ id: m.id, name: m.name })
                  }
                >
                  {m.name}
                </button>
              </li>
            ))}
          </ul>
          <Link to="/" style={styles.backLink}>
            ← Back to all trips
          </Link>
        </div>
      </div>
    )
  }

  const myResp = responses.find(
    r => r.memberId === member.id
  )
  if (!myResp) {
    return (
      <Navigate
        to={`/questionario?group=${groupId}`}
        replace
      />
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>
          {group.name}
        </h2>

        {/* ▶️ Progress & Generate Cards (HIDE once round starts) */}
        {!round && (
          <>
            <div style={styles.progressContainer}>
              <progress
                value={completedCount}
                max={totalMembers}
                style={styles.progressBar}
              />
              <div>
                {completedCount} / {totalMembers} completed
              </div>
            </div>

            <button
              type="button"
              disabled={!allDone}
              onClick={() => {
                console.log('Generate cards for group', groupId)
              }}
              style={{
                ...styles.generateBtn,
                backgroundColor: allDone ? COLORS.accent : '#666',
                cursor: allDone ? 'pointer' : 'not-allowed',
              }}
            >
              Generate Cards
            </button>

            {!allDone && (
              <p style={styles.waitingText}>
                Waiting for all members to finish…
              </p>
            )}
          </>
        )}

        {/* ▶️ Voting / Winner UI */}
        {allDone && (
          <>
            {!round && (
              <div style={styles.center}>
                Loading round…
              </div>
            )}
            {round && (winner || round.winner) && (
              <div style={styles.page}>
                <Confetti />
                <div style={styles.container}>
                  <h1
                    style={{
                      color: COLORS.accent,
                    }}
                  >
                    🎉 Trip Chosen:{' '}
                    {winner || round.winner}{' '}
                    🎉
                  </h1>
                  <p style={{ margin: '1rem 0' }}>
                    {round.status ===
                    'COIN_TOSS'
                      ? `No unanimous decision by round ${round.number}, so we flipped a coin!`
                      : `All members voted yes on ${
                          winner || round.winner
                        }!`}
                  </p>
                  <a
                    href={`https://www.flyscanner.com/flights-to/${encodeURIComponent(
                      winner || round.winner
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.bookLink}
                  >
                    Buy on FlyScanner ✈️
                  </a>
                </div>
              </div>
            )}
            {round && !winner && !round.winner && (
              <div style={styles.page}>
                <div style={styles.container}>
                  <h2 style={styles.title}>
                    {group.name} — Round {round.number}
                  </h2>
                  <div style={styles.headsContainer}>
                    {group.members.map(m => {
                      const votesForPlace = roundVotes.filter(
                        v => v.memberId === m.id
                      )
                      return (
                        <Link
                          key={m.id}
                          to={`/group/user?group=${groupId}&member=${m.id}`}
                          style={styles.headLink}
                        >
                          <div style={styles.headBadge}>
                            <span style={styles.headIcon}>🧑</span>
                            <span style={styles.headName}>{m.name}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                  <div style={styles.recommendations}>
                    <h3 style={styles.recTitle}>Vote on Top 5 Places</h3>
                    {[
                      { name: 'París, Francia' },
                      { name: 'Barcelona, España' },
                      { name: 'Roma, Italia' },
                      { name: 'Tokio, Japón' },
                      { name: 'Nueva York, EE.UU.' },
                    ].map((place, i) => {
                      const votesForPlace = roundVotes.filter(
                        v => v.place === place.name
                      )
                      const score = votesForPlace.reduce(
                        (sum, v) => sum + (v.value ? 1 : 0),
                        0
                      )
                      return (
                        <RankingCardComponent
                          key={place.name}
                          name={place.name}
                          score={score}
                          position={i + 1}
                          placeVotes={votesForPlace}
                          members={group.members}
                          currentMemberId={member.id}
                          onVote={castVote}
                        />
                      )
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await fetch(
                        `/api/groups/${group.id}/rounds/${round.id}/close`,
                        { method: 'POST' }
                      )
                      const data = await res.json()
                      if (data.winner) {
                        setWinner(data.winner)
                      } else {
                        const next = await fetch(
                          `/api/groups/${group.id}/rounds`,
                          { method: 'POST' }
                        ).then(r => r.json())
                        setRound(next)
                        setRoundVotes([])
                      }
                    }}
                    style={{
                      marginTop: 24,
                      padding: '12px 24px',
                      fontSize: 16,
                      cursor: 'pointer',
                    }}
                  >
                    {round.number >= 5
                      ? 'Flip coin & choose!'
                      : `Close Round ${round.number}`}
                  </button>
                  <Link to="/" style={styles.backLink}>
                    ← Back to all trips
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
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
    maxWidth: 600,
    margin: '0 auto',
    padding: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: '1.75rem',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: '1.25rem',
    marginBottom: 16,
    opacity: 0.85,
  },
  center: { padding: 32, textAlign: 'center' },
  backLink: {
    color: COLORS.accent,
    textDecoration: 'none',
    marginTop: 16,
    display: 'inline-block',
  },
  memberList: {
    listStyle: 'none',
    padding: 0,
    marginBottom: 24,
  },
  memberItem: { margin: '8px 0' },
  selectBtn: {
    padding: '8px 16px',
    fontSize: 16,
    background: COLORS.cardBg,
    border: '1px solid #444',
    borderRadius: 4,
    color: COLORS.text,
    cursor: 'pointer',
  },
  progressContainer: {
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: '12px',
    marginBottom: 4,
  },
  generateBtn: {
    padding: '12px 24px',
    fontSize: '1rem',
    border: 'none',
    borderRadius: 4,
    color: '#fff',
    marginBottom: 24,
  },
  waitingText: {
    color: '#aaa',
    marginTop: 8,
  },
  headsContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  headLink: { textDecoration: 'none' },
  headBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 8,
    background: COLORS.cardBg,
    borderRadius: 8,
    minWidth: 80,
  },
  headIcon: { fontSize: '1.5rem', marginBottom: 4 },
  headName: { fontSize: '0.9rem', color: COLORS.text },
  recommendations: { marginBottom: 24 },
  recTitle: { marginBottom: 12 },
  bookLink: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '12px 24px',
    backgroundColor: COLORS.accent,
    color: '#FFF',
    textDecoration: 'none',
    borderRadius: 4,
    fontWeight: 600,
  },
}
