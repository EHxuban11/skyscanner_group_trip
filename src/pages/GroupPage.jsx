import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link, Navigate, useLocation } from 'react-router-dom';
import Confetti from 'react-confetti';
import { MemberContext } from '../context/MemberContext';
import RankingCardComponent from '../components/RankingCardComponent.jsx';

const GroupPage = () => {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('group');
  const { member, setMember } = useContext(MemberContext);
  const location = useLocation();

  const [state, setState] = useState({
    group: null,
    responses: [],
    rounds: [],
    round: null,
    roundVotes: [],
    loading: true,
    error: null,
    winner: null,
    showConfetti: false,
    confettiTimeout: false,
  });

  const { group, responses, rounds, round, roundVotes, loading, error, winner, showConfetti, confettiTimeout } = state;

  const PLACES = [
    'París, Francia',
    'Barcelona, España',
    'Roma, Italia',
    'Tokio, Japón',
    'Nueva York, EE.UU.',
  ];

  const totalMembers = group?.members?.length || 0;
  const completedCount = responses.length;
  const allDone = totalMembers > 0 && completedCount === totalMembers;

  // Fetch group and questionnaire data with real-time polling
  useEffect(() => {
    if (!groupId) {
      setState(prev => ({ ...prev, error: 'No group ID provided.', loading: false }));
      return;
    }

    const fetchGroupData = async () => {
      try {
        const groupRes = await fetch(`/api/groups/${groupId}`);
        if (!groupRes.ok) throw new Error(groupRes.statusText);
        const groupData = await groupRes.json();
        
        const respPromises = groupData.members.map(async (m) => {
          try {
            const resp = await fetch(`/api/groups/${groupId}/members/${m.id}/questionnaire`);
            if (resp.status === 204) return null;
            if (!resp.ok) {
              console.warn(`Warning: questionnaire ${m.id} status ${resp.status}`);
              return null;
            }
            return resp.json();
          } catch {
            return null;
          }
        });

        const resps = await Promise.all(respPromises);
        const newResponses = resps.filter(r => r && r.budget != null);
        const isAllDone = newResponses.length === groupData.members.length;

        setState(prev => ({
          ...prev,
          group: groupData,
          responses: newResponses,
          loading: false,
          showConfetti: isAllDone ? true : prev.showConfetti,
          confettiTimeout: isAllDone ? true : prev.confettiTimeout,
        }));
      } catch (e) {
        setState(prev => ({ ...prev, error: e.message, loading: false }));
      }
    };

    fetchGroupData(); // Initial fetch

    // Poll every second
    const intervalId = setInterval(fetchGroupData, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [groupId]);

  // Handle confetti timeout
  useEffect(() => {
    if (!allDone || !confettiTimeout) return;

    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, confettiTimeout: false }));
    }, 5000); // Show confetti for 5 seconds

    return () => clearTimeout(timer);
  }, [allDone, confettiTimeout]);

  // Fetch rounds and create new round if needed, only after confetti timeout
  useEffect(() => {
    if (!group || !allDone || confettiTimeout) return;

    const fetchRounds = async () => {
      try {
        const roundsRes = await fetch(`/api/groups/${group.id}/rounds`);
        const allRounds = await roundsRes.json();
        const openRound = allRounds.find(r => r.status === 'OPEN');

        if (openRound) {
          setState(prev => ({ ...prev, rounds: allRounds, round: openRound }));
        } else {
          const newRoundRes = await fetch(`/api/groups/${group.id}/rounds`, { method: 'POST' });
          const newRound = await newRoundRes.json();
          setState(prev => ({ ...prev, rounds: allRounds, round: newRound }));
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchRounds();
  }, [group, allDone, confettiTimeout]);

  // Fetch round votes
  useEffect(() => {
    if (!round) return;

    const fetchVotes = async () => {
      try {
        const votesRes = await fetch(`/api/groups/${group.id}/rounds/${round.id}/votes`);
        const votes = await votesRes.json();
        setState(prev => ({ ...prev, roundVotes: votes }));
      } catch {
        // Ignore errors
      }
    };

    fetchVotes();
  }, [round]);

  // Determine winner
  useEffect(() => {
    if (!group || !roundVotes.length || winner) return;

    for (const place of PLACES) {
      const unanimous = group.members.every(m =>
        roundVotes.some(v => v.place === place && v.memberId === m.id && v.value === true)
      );
      if (unanimous) {
        setState(prev => ({ ...prev, winner: place }));
        return;
      }
    }
  }, [roundVotes, group, winner]);

  const castVote = async (place, value) => {
    if (!member || !round) return;
    try {
      const res = await fetch(`/api/groups/${groupId}/rounds/${round.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id, place, value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setState(prev => ({
          ...prev,
          roundVotes: prev.roundVotes
            .filter(x => !(x.place === place && x.memberId === member.id))
            .concat(updated),
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const closeRound = async () => {
    try {
      const res = await fetch(`/api/groups/${group.id}/rounds/${round.id}/close`, { method: 'POST' });
      const data = await res.json();
      if (data.winner) {
        setState(prev => ({ ...prev, winner: data.winner }));
      } else {
        const nextRoundRes = await fetch(`/api/groups/${group.id}/rounds`, { method: 'POST' });
        const nextRound = await nextRoundRes.json();
        setState(prev => ({ ...prev, round: nextRound, roundVotes: [] }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const MemberSelection = () => (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full p-6 text-center">
        <h2 className="text-2xl font-bold mb-6">{group.name}</h2>
        <h3 className="text-lg mb-4 opacity-80">Who are you?</h3>
        <ul className="space-y-3">
          {group.members.map(m => (
            <li key={m.id}>
              <button
                className="w-full py-2 px-4 bg-gray-700 rounded border border-gray-600 hover:bg-gray-600"
                onClick={() => setMember({ id: m.id, name: m.name })}
              >
                {m.name}
              </button>
            </li>
          ))}
        </ul>
        <Link to="/" className="mt-6 inline-block text-blue-500 hover:underline">
          ← Back to all trips
        </Link>
      </div>
    </div>
  );

  const ProgressSection = () => (
    <>
      {showConfetti && <Confetti />}
      <div className="mb-6 flex flex-col items-center">
        <progress
          value={completedCount}
          max={totalMembers}
          className="w-full h-3 mb-2"
        />
        <span>{completedCount} / {totalMembers} completed</span>
      </div>
      <p className="mt-2 text-gray-400">The game will start when everybody finishes the questionnaire.</p>
    </>
  );

  const WinnerSection = () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Confetti />
      <div className="max-w-md w-full p-6 text-center">
        <h1 className="text-3xl font-bold text-blue-500 mb-4">
          🎉 Trip Chosen: {winner || round.winner} 🎉
        </h1>
        <p className="mb-4">
          {round.status === 'COIN_TOSS'
            ? `No unanimous decision by round ${round.number}, so we flipped a coin!`
            : `All members voted yes on ${winner || round.winner}!`}
        </p>
        <a
          href={`https://www.flyscanner.com/flights-to/${encodeURIComponent(winner || round.winner)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block py-3 px-6 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
        >
          Buy on FlyScanner ✈️
        </a>
      </div>
    </div>
  );

  const VotingSection = () => (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          {group.name} — Round {round.number}
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {group.members.map(m => (
            <Link
              key={m.id}
              to={`/group/user?group=${groupId}&member=${m.id}`}
              className="flex flex-col items-center p-3 bg-gray-800 rounded-lg min-w-[80px]"
            >
              <span className="text-2xl mb-1">🧑</span>
              <span className="text-sm text-white">{m.name}</span>
            </Link>
          ))}
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Vote on Top 5 Places</h3>
          {PLACES.map((place, i) => {
            const votesForPlace = roundVotes.filter(v => v.place === place);
            const score = votesForPlace.reduce((sum, v) => sum + (v.value ? 1 : 0), 0);
            return (
              <RankingCardComponent
                key={place}
                name={place}
                score={score}
                position={i + 1}
                placeVotes={votesForPlace}
                members={group.members}
                currentMemberId={member.id}
                onVote={castVote}
              />
            );
          })}
        </div>
        <button
          type="button"
          onClick={closeRound}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {round.number >= 5 ? 'Flip coin & choose!' : `Close Round ${round.number}`}
        </button>
        <Link to="/" className="mt-6 inline-block text-blue-500 hover:underline">
          ← Back to all trips
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading…</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Link to="/" className="text-blue-500 hover:underline">← Back to all trips</Link>
        </div>
      </div>
    );
  }

  if (!member) {
    return <MemberSelection />;
  }

  const myResp = responses.find(r => r.memberId === member.id);
  if (!myResp) {
    return <Navigate to={`/questionario?group=${groupId}`} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">{group.name}</h2>
        {!round && <ProgressSection />}
        {allDone && (
          <>
            {!round && <div className="text-center">Loading round…</div>}
            {round && (winner || round.winner) && <WinnerSection />}
            {round && !winner && !round.winner && <VotingSection />}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupPage;