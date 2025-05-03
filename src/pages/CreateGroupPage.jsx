import React, { useState } from 'react';

const COLORS = {
  pageBg: '#05203C',       // Dark blue background
  cardOverlay: 'rgba(255, 255, 255, 0.1)', // Slight white tint for card
  text: '#FFFFFF',         // White text
  hover: '#144679',        // Hover state
  active: '#0362E3',       // Active/primary state
};

function CreateGroupPage() {
  const [groupName, setGroupName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [members, setMembers] = useState([]);
  const [shareLink, setShareLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAddMember = () => {
    const name = memberName.trim();
    if (!name) return;
    setMembers(prev => [...prev, name]);
    setMemberName('');
  };

  const handleRemoveMember = (index) => {
    setMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateGroup = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName, members }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create group');
      }
      const data = await res.json();
      setShareLink(`${window.location.origin}/join?group=${data.id}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  const whatsappShare = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareLink)}`;
  const instagramShare = `https://www.instagram.com/?url=${encodeURIComponent(shareLink)}`;

  return (
    <div className="create-group-page">
      <style dangerouslySetInnerHTML={{ __html: `
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
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
          max-width: 400px;
          width: 100%;
        }
        .card h2 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 1.5rem;
          font-weight: bold;
          text-align: center;
        }
        .input-field {
          display: block;
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
          display: inline-block;
          padding: 8px 16px;
          margin: 8px 8px 8px 0;
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
          font-size: 18px;
          padding: 12px;
          width: 100%;
          margin-top: 16px;
        }
        .btn-primary:hover {
          background-color: ${COLORS.hover};
          border-color: ${COLORS.hover};
        }
        .member-list {
          list-style: none;
          padding: 0;
          margin: 0 0 24px;
        }
        .member-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
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
        .share-container button {
          width: 100%;
          margin: 8px 0;
        }
      ` }} />

      <div className="card">
        {shareLink ? (
          <>
            <h2>Group Created!</h2>
            <p style={{ textAlign: 'center' }}>Share this link with your members:</p>
            <textarea
              className="input-field"
              readOnly
              rows={2}
              value={shareLink}
              style={{ resize: 'none' }}
            />
            <div className="share-container">
              <button className="btn btn-primary" onClick={handleCopy}>
                Copy Link
              </button>
              <a href={whatsappShare} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Share on WhatsApp
              </a>
              <a href={instagramShare} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Share on Instagram
              </a>
            </div>
          </>
        ) : (
          <>
            <h2>Create a New Group</h2>
            <label htmlFor="groupName">Group Name</label>
            <input
              id="groupName"
              className="input-field"
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
            />

            <label htmlFor="memberName">Add Member</label>
            <input
              id="memberName"
              className="input-field"
              type="text"
              placeholder="Enter person's name"
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

            {error && (
              <div style={{ color: 'red', marginTop: '1rem' }}>
                {error}
              </div>
            )}

            {members.length > 0 && (
              <ul className="member-list">
                {members.map((name, idx) => (
                  <li key={idx} className="member-item">
                    <span>{name}</span>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveMember(idx)}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              className="btn btn-primary"
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || members.length === 0 || submitting}
            >
              {submitting ? 'Creating...' : 'Create Group'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CreateGroupPage;
