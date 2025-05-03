import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/groups')
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => setGroups(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading groups…</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="landing-page" style={{ padding: '24px' }}>
      <h2>All Groups</h2>
      {groups.length === 0 ? (
        <p>No groups found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {groups.map(group => (
            <li key={group.id} style={{ margin: '8px 0' }}>
              <Link to={`/group?group=${group.id}`}>{group.name} ({group.members.length} members)</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LandingPage;
