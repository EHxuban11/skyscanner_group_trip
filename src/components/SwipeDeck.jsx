// src/components/SwipeDeck.jsx
import React, { useState, useMemo } from 'react'
import TinderCard from 'react-tinder-card'

const COLORS = { /* …as before…*/ }

export default function SwipeDeck({ deckName, cards, onComplete }) {
  const [lastDir, setLastDir] = useState(null)
  const [idx, setIdx] = useState(cards.length - 1)
  const refs = useMemo(() => cards.map(() => React.createRef()), [cards])

  const swiped = (dir, card, i) => {
    setLastDir(dir)
    setIdx(i - 1)
    onComplete(deckName, card, dir)
  }

  const swipe = d => {
    if (idx < 0) return
    refs[idx].current.swipe(d)
  }

  return (
    <div className="swipe-deck">
      <h3>{deckName}</h3>
      <div className="card-container">
        {cards.map((c, i) => (
          <TinderCard
            ref={refs[i]} key={c.query}
            onSwipe={d => swiped(d, c, i)}
            preventSwipe={['up']}
          >
            {/* your card markup using c.image_url, c.description, etc. */}
          </TinderCard>
        ))}
      </div>

      <div className="controls">
        <button onClick={() => swipe('left')}>👎</button>
        <button onClick={() => swipe('down')}>😐</button>
        <button onClick={() => swipe('right')}>👍</button>
      </div>

      {lastDir && <div>Último gesto: {lastDir}</div>}
    </div>
  )
}
