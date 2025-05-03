import React, { useState } from 'react';

const COLORS = {
  pageBg: '#05203C',
  cardOverlay: 'rgba(255, 255, 255, 0.1)',
  text: '#FFFFFF',
  hover: '#144679',
  active: '#0362E3',
};

const INTERESTS = [
  'Vuelos más baratos',
  'Vuelos directos',
  'Recomendados para ti',
  '✨ Destinos infravalorados',
  '✨ Playa',
  '✨ Arte y cultura',
  '✨ Comida excelente',
  '✨ Aventuras al aire libre',
  '✨ Vida nocturna y entretenimiento',
];

function QuestionnairePage() {
  const [budget, setBudget] = useState(2500);
  const [tripLength, setTripLength] = useState(7);
  const [ecoPriority, setEcoPriority] = useState(2);
  const [interests, setInterests] = useState({});

  const handleInterestToggle = (item) => {
    setInterests(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const handleSubmit = () => {
    const selectedInterests = INTERESTS.filter(i => interests[i]);
    const payload = { budget, tripLength, ecoPriority, interests: selectedInterests };
    console.log('Questionnaire submitted:', payload);
    alert('¡Cuestionario guardado! Continúa para ver tus resultados.');
  };

  return (
    <div className="questionnaire-page">
      <style dangerouslySetInnerHTML={{ __html: `
        .questionnaire-page {
          background-color: ${COLORS.pageBg};
          color: ${COLORS.text};
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
          font-family: Arial, sans-serif;
        }
        .card {
          background-color: ${COLORS.cardOverlay};
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
          max-width: 500px;
          width: 100%;
        }
        .card h2 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 1.5rem;
        }
        .field {
          margin-bottom: 24px;
        }
        .field label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
        }
        .slider {
          width: 100%;
        }
        .value-label {
          margin-top: 4px;
          font-size: 0.9rem;
        }
        .interest-container {
          display: flex;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        .interest-chip {
          margin: 4px;
          padding: 6px 12px;
          border: 1px solid ${COLORS.text};
          border-radius: 16px;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s, border-color 0.2s;
          font-size: 0.9rem;
          white-space: nowrap;
        }
        .interest-chip:hover {
          background-color: ${COLORS.hover};
          border-color: ${COLORS.hover};
        }
        .interest-chip.selected {
          background-color: ${COLORS.active};
          border-color: ${COLORS.active};
        }
        .btn-primary {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          background-color: ${COLORS.active};
          color: ${COLORS.text};
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s;
        }
        .btn-primary:hover {
          background-color: ${COLORS.hover};
        }
      ` }} />

      <div className="card">
        <h2>Cuestionario inicial</h2>

        <div className="field">
          <label htmlFor="budget">Presupuesto (€):</label>
          <input
            id="budget"
            type="range"
            min="0"
            max="5000"
            step="50"
            className="slider"
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
          />
          <div className="value-label">€ {budget}</div>
        </div>

        <div className="field">
          <label htmlFor="tripLength">Duración del viaje (días):</label>
          <input
            id="tripLength"
            type="range"
            min="1"
            max="30"
            step="1"
            className="slider"
            value={tripLength}
            onChange={e => setTripLength(Number(e.target.value))}
          />
          <div className="value-label">{tripLength} días</div>
        </div>

        <div className="field">
          <label htmlFor="ecoPriority">Prioridad ecológica:</label>
          <input
            id="ecoPriority"
            type="range"
            min="1"
            max="3"
            step="1"
            className="slider"
            value={ecoPriority}
            onChange={e => setEcoPriority(Number(e.target.value))}
          />
          <div className="value-label">
            {ecoPriority === 1 ? 'Baja' : ecoPriority === 2 ? 'Normal' : 'Alta'}
          </div>
        </div>

        <div className="field">
          <label>Intereses de viaje:</label>
          <div className="interest-container">
            {INTERESTS.map(item => (
              <div
                key={item}
                className={`interest-chip ${interests[item] ? 'selected' : ''}`}
                onClick={() => handleInterestToggle(item)}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={handleSubmit}>
          Guardar cuestionario
        </button>
      </div>
    </div>
  );
}

export default QuestionnairePage;
