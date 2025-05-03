// Ensure you install the swipe lib and peer dep:
// npm install react-tinder-card @react-spring/web
import React, { useState, useMemo } from 'react';
import TinderCard from 'react-tinder-card';

const COLORS = {
  pageBg: '#e0e0e0',          // light grey
  cardBg: '#FFFFFF',
  textPrimary: '#05203C',
  textSecondary: '#555555',
  accent: '#0362E3',
  shadow: 'rgba(0, 0, 0, 0.15)',
  controlBg: '#FFFFFF',
  controlBorder: '#0362E3',
  controlHoverBg: '#0362E3',
  controlHoverColor: '#FFFFFF',
};

const cardsData = [
  { id: 1, title: 'París, Francia', image: 'https://picsum.photos/seed/paris/400/600', description: 'Escapada romántica en la Ciudad de la Luz.', price: 1200 },
  { id: 2, title: 'Roma, Italia', image: 'https://picsum.photos/seed/rome/400/600', description: 'Descubre el Coliseo y la historia antigua.', price: 1000 },
  { id: 3, title: 'Tokio, Japón', image: 'https://picsum.photos/seed/tokyo/400/600', description: 'Urbanismo futurista y tradición milenaria.', price: 1500 },
  { id: 4, title: 'Nueva York, EE.UU.', image: 'https://picsum.photos/seed/newyork/400/600', description: 'La ciudad que nunca duerme te espera.', price: 1300 },
  { id: 5, title: 'Barcelona, España', image: 'https://picsum.photos/seed/barcelona/400/600', description: 'Gaudí, playa y vida vibrante.', price: 900 },
  { id: 6, title: 'Sídney, Australia', image: 'https://picsum.photos/seed/sydney/400/600', description: 'Opera House y playas icónicas.', price: 1800 },
  { id: 7, title: 'Cape Town, Sudáfrica', image: 'https://picsum.photos/seed/capetown/400/600', description: 'Montaña de la Mesa y viñedos.', price: 1400 },
  { id: 8, title: 'Río de Janeiro, Brasil', image: 'https://picsum.photos/seed/rio/400/600', description: 'Playas de Copacabana y carnaval.', price: 1100 },
  { id: 9, title: 'Toronto, Canadá', image: 'https://picsum.photos/seed/toronto/400/600', description: 'Diversidad cultural y CN Tower.', price: 1250 },
  { id:10, title: 'Dubái, EAU', image: 'https://picsum.photos/seed/dubai/400/600', description: 'Rascacielos futuristas y lujo.', price: 1600 },
];

function CardsSwipePage() {
  const [lastDirection, setLastDirection] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(cardsData.length - 1);
  const childRefs = useMemo(() => cardsData.map(() => React.createRef()), []);

  const swiped = (dir, name, index) => {
    setLastDirection(dir);
    setCurrentIndex(index - 1);
  };
  const outOfFrame = name => console.log(name + ' left');

  const swipeLeft = () => {
    if (currentIndex < 0) return;
    childRefs[currentIndex].current.swipe('left');
  };
  const swipeRight = () => {
    if (currentIndex < 0) return;
    childRefs[currentIndex].current.swipe('right');
  };
  const swipeNeutral = () => {
    if (currentIndex < 0) return;
    childRefs[currentIndex].current.swipe('down');
  };

  return (
    <div className="cardswipe-page">
      <style dangerouslySetInnerHTML={{ __html: `
        .cardswipe-page {
          background: ${COLORS.pageBg};
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          overflow: visible;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          position: relative;
        }
        .card-container {
          position: relative;
          width: 340px;
          height: 540px;
          perspective: 1000px;
          margin-bottom: 24px;
        }
        .swipe {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        .card {
          background: ${COLORS.cardBg};
          border-radius: 16px;
          box-shadow: 0 8px 16px ${COLORS.shadow};
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.3s ease;
        }
        .card-image-container {
          flex: 0 0 70%;
          overflow: hidden;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .card-content {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .title {
          margin: 0;
          font-size: 1.3rem;
          color: ${COLORS.textPrimary};
        }
        .price {
          font-size: 1.1rem;
          font-weight: bold;
          color: ${COLORS.accent};
        }
        .description {
          margin-top: 8px;
          font-size: 0.95rem;
          color: ${COLORS.textSecondary};
          line-height: 1.4;
        }
        .controls {
          position: absolute;
          bottom: 24px;
          display: flex;
          gap: 24px;
          z-index: 10;
        }
        .control-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 2px solid ${COLORS.controlBorder};
          background: ${COLORS.controlBg};
          color: ${COLORS.controlBorder};
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .control-btn:hover {
          background: ${COLORS.controlHoverBg};
          color: ${COLORS.controlHoverColor};
        }
        .last-direction {
          position: absolute;
          bottom: 10px;
          font-size: 1rem;
          color: ${COLORS.accent};
        }
      ` }} />

      <div className="card-container">
        {cardsData.map((card, idx) => (
          <TinderCard
            ref={childRefs[idx]}
            className="swipe"
            key={card.id}
            onSwipe={(dir) => swiped(dir, card.title, idx)}
            onCardLeftScreen={() => outOfFrame(card.title)}
            preventSwipe={['up']}
          >
            <div className="card">
              <div className="card-image-container">
                <img className="card-image" src={card.image} alt={card.title} />
              </div>
              <div className="card-content">
                <div className="card-header">
                  <h3 className="title">{card.title}</h3>
                  <span className="price">€{card.price}</span>
                </div>
                <p className="description">{card.description}</p>
              </div>
            </div>
          </TinderCard>
        ))}
      </div>
      <div className="controls">
        <button className="control-btn" onClick={swipeLeft} aria-label="Dislike">👎</button>
        <button className="control-btn" onClick={swipeNeutral} aria-label="Neutral">😐</button>
        <button className="control-btn" onClick={swipeRight} aria-label="Like">👍</button>
      </div>
      {lastDirection && <div className="last-direction">Swiped: {lastDirection}</div>}
    </div>
  );
}

export default CardsSwipePage;
