import React, { useState, useEffect } from 'react';

const COLORS = {
  pageBg: '#05203C',
  cardBg: 'rgba(255,255,255,0.1)',
  text: '#FFFFFF',
  hover: '#144679',
  active: '#0362E3',
};

function GroupPage() {
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (!data) return;
    try {
      const payload = JSON.parse(atob(data));
      setGroupName(payload.groupName || 'Grupo');
      setMembers(Array.isArray(payload.members) ? payload.members : []);
    } catch (err) {
      console.error('Failed to parse group data', err);
    }
  }, []);

  return (
    <div className="group-page">
      <style dangerouslySetInnerHTML={{ __html: `
        .group-page {
          background: ${COLORS.pageBg};
          color: ${COLORS.text};
          min-height: 100vh;
          padding: 32px;
          font-family: Arial, sans-serif;
        }
        .header {
          max-width: 800px;
          margin: 0 auto 24px;
        }
        .header h1 {
          margin: 0;
          font-size: 2rem;
        }
        .members-section {
          max-width: 800px;
          margin: 0 auto;
        }
        .members-section h2 {
          font-size: 1.25rem;
          margin-bottom: 16px;
        }
        .member-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .member-item {
          background: ${COLORS.cardBg};
          padding: 8px 16px;
          border-radius: 16px;
          font-size: 1rem;
          display: flex;
          align-items: center;
        }
      ` }} />

      <div className="header">
        <h1>{groupName}</h1>
      </div>

      <div className="members-section">
        <h2>Miembros del grupo</h2>
        {members.length === 0 ? (
          <p>No hay miembros en este grupo.</p>
        ) : (
          <ul className="member-list">
            {members.map((name, idx) => (
              <li key={idx} className="member-item">
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default GroupPage;
