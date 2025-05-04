// src/pages/QuestionnairePage.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { MemberContext } from '../context/MemberContext'
import TinderCard from 'react-tinder-card'

const COLORS = {
  pageBg:     '#05203C',
  cardOverlay:'rgba(255,255,255,0.1)',
  text:       '#FFFFFF',
  hover:      '#144679',
  active:     '#0362E3',
}

export default function QuestionnairePage() {
  const { member } = useContext(MemberContext)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const groupId = searchParams.get('group')

  // ─── form state ─────────────────────────────
  const [budget, setBudget]       = useState(1450)
  const [tripLength, setTripLength] = useState(17)

  // ─── decks & responses ──────────────────────
  const [decks, setDecks]                 = useState(null)
  const [deckResponses, setDeckResponses] = useState({})
  const [currentIndex, setCurrentIndex]   = useState({})

  // refs per deck
  const childRefs = useMemo(() => {
    if (!decks) return {}
    return Object.fromEntries(
      Object.entries(decks).slice(0,4).map(([deckName, cards]) => [
        deckName,
        cards.map(() => React.createRef())
      ])
    )
  }, [decks])

  // init decks & indexes
  useEffect(() => {
    fetch('/questionnaire_cards.json')
      .then(r => r.json())
      .then(data => {
        setDecks(data)
        const idxs = {}
        Object.entries(data).slice(0,4).forEach(([name, cards]) => {
          idxs[name] = cards.length - 1
        })
        setCurrentIndex(idxs)
      })
      .catch(console.error)
  }, [])

  // record each swipe/button action
  function recordAction(deckName, card, dir) {
    setDeckResponses(prev => {
      const arr = prev[deckName] || []
      return {
        ...prev,
        [deckName]: [...arr, { query: card.query, action: dir }]
      }
    })
  }

  function onSwipe(dir, deckName, idx) {
    const card = decks[deckName][idx]
    recordAction(deckName, card, dir)
    setCurrentIndex(ci => ({ ...ci, [deckName]: idx - 1 }))
  }

  function swipe(deckName, dir) {
    const idx = currentIndex[deckName]
    if (idx >= 0) {
      childRefs[deckName][idx].current.swipe(dir)
    }
  }

  async function handleSubmit() {
    const payload = {
      budget,
      tripLength,
      deckResponses,   // include swipes & button actions
    }
    await fetch(
      `/api/groups/${groupId}/members/${member.id}/questionnaire`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      }
    )
    navigate(`/group?group=${groupId}`)
  }

  return (
    <div className="questionnaire-page">
      <style dangerouslySetInnerHTML={{ __html: `
        .questionnaire-page{background:${COLORS.pageBg};color:${COLORS.text};
          min-height:100vh;padding:24px;display:flex;flex-direction:column;
          align-items:center;font-family:Arial,sans-serif;}
        .questionnaire-content{display:flex;gap:24px;width:100%;max-width:1000px;}
        .left-panel,.right-panel{flex:1;}

        .left-panel .card{background:${COLORS.cardOverlay};padding:24px;
          border-radius:8px;box-shadow:0 4px 8px rgba(0,0,0,0.4);}
        .field{margin-bottom:24px;}
        .field label{display:block;margin-bottom:8px;font-weight:bold;}
        .slider{width:100%;}
        .value-label{margin-top:4px;font-size:.9rem;}
        .btn-primary{margin-top:24px;padding:10px 20px;background:${COLORS.active};
          color:${COLORS.text};border:none;border-radius:4px;cursor:pointer;transition:.2s;}
        .btn-primary:hover{background:${COLORS.hover};}

        .cards-grid-2x2{display:grid;
          grid-template:repeat(2,1fr)/repeat(2,1fr);gap:16px;height:600px;}
        .deck-cell{position:relative;overflow:hidden;
          background:#f0f0f0;border-radius:8px;}
        .deck-title{position:absolute;top:8px;left:8px;color:#333;
          font-weight:bold;text-transform:capitalize;user-select:none;}
        .swipe-container{position:absolute;inset:0;padding-top:32px;}
        .swipe{position:absolute;inset:0;}
        .json-card{display:flex;flex-direction:column;width:100%;height:100%;
          background:#fff;border-radius:8px;box-shadow:0 4px 8px rgba(0,0,0,0.2);
          overflow:hidden;user-select:none;}
        .card-image-container{width:100%;height:66.6667%;overflow:hidden;}
        .json-card img{width:100%;height:100%;object-fit:cover;
          user-drag:none;user-select:none;}
        .json-card-content{flex:1;padding:12px;display:flex;
          flex-direction:column;justify-content:space-between;user-select:none;
          color:#000;}
        .json-card-content h4{margin:0 0 8px;font-size:1rem;color:#222;}
        .json-card-content p{margin:0;font-size:.85rem;color:#444;}

        .controls{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);
          display:flex;gap:16px;z-index:20;}
        .controls button{width:32px;height:32px;border:none;border-radius:50%;
          font-size:18px;cursor:pointer;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,0.2);}
        .controls button:hover{background:${COLORS.active};color:#fff;}
      `}}/>

      <div className="questionnaire-content">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="card">
            <h2>Cuestionario inicial</h2>

            <div className="field">
              <label>Presupuesto (€):</label>
              <input type="range" min="0" max="5000" step="50"
                className="slider" value={budget}
                onChange={e => setBudget(+e.target.value)} />
              <div className="value-label">€ {budget}</div>
            </div>

            <div className="field">
              <label>Duración (días):</label>
              <input type="range" min="1" max="30" step="1"
                className="slider" value={tripLength}
                onChange={e => setTripLength(+e.target.value)} />
              <div className="value-label">{tripLength} días</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          {!decks ? (
            <p>Loading decks…</p>
          ) : (
            <div className="cards-grid-2x2">
              {Object.entries(decks).slice(0,4).map(([deckName,cards]) => (
                <div className="deck-cell" key={deckName}>
                  <div className="deck-title">{deckName}</div>
                  <div className="swipe-container">
                    {cards.map((c,i) => (
                      <TinderCard
                        ref={childRefs[deckName][i]}
                        className="swipe"
                        key={i}
                        onSwipe={dir => onSwipe(dir, deckName, i)}
                        preventSwipe={[]}
                      >
                        <div className="json-card">
                          <div className="card-image-container">
                            <img src={c.image_url} alt={c.query} draggable="false"/>
                          </div>
                          <div className="json-card-content">
                            <h4>{c.query}</h4>
                            <p>{c.description}</p>
                          </div>
                          <div className="controls">
                            <button onClick={() => swipe(deckName,'left')}>👎</button>
                            <button onClick={() => swipe(deckName,'down')}>😐</button>
                            <button onClick={() => swipe(deckName,'right')}>👍</button>
                          </div>
                        </div>
                      </TinderCard>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button className="btn-primary" onClick={handleSubmit}>
        Guardar cuestionario
      </button>
    </div>
  )
}
