import { useState } from 'react';
import { useCurrentSeason } from '../hooks/useCurrentSeason.js';
import { api } from '../api/client.js';

export default function Seasons() {
  const { season, refresh } = useCurrentSeason();
  const [name, setName] = useState('');
  const [weekCount, setWeekCount] = useState(4);
  const [error, setError] = useState(null);

  const handleStart = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.startSeason({ name: name.trim() || undefined, week_count: Number(weekCount) });
      setName('');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEnd = async () => {
    await api.endSeason(season.id);
    refresh();
  };

  if (season === undefined) return <p>Loading…</p>;

  return (
    <div className="seasons">
      {season && (
        <div className="season-summary">
          <h2>{season.name || `Season ${season.number}`}</h2>
          <p>Status: {season.status} • {season.weeks.length} of {season.week_count} weeks</p>
          <table>
            <thead>
              <tr>
                <th>Week</th>
                <th>Status</th>
                <th>Jake</th>
                <th>Paula</th>
              </tr>
            </thead>
            <tbody>
              {season.weeks.map((w) => (
                <tr key={w.id}>
                  <td>{w.week_number}</td>
                  <td>{w.status}</td>
                  <td>{w.totals.jake.points} pts / {w.totals.jake.difficulty}★</td>
                  <td>{w.totals.paula.points} pts / {w.totals.paula.difficulty}★</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleEnd}>📕 Close This Chapter</button>
        </div>
      )}

      {!season && (
        <form className="season-form" onSubmit={handleStart}>
          <h2>📖 Begin a New Chapter</h2>
          <label>
            Name (optional)
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer Grind" />
          </label>
          <label>
            Weeks
            <input type="number" min="1" value={weekCount} onChange={(e) => setWeekCount(e.target.value)} />
          </label>
          <button type="submit">📜 Begin Chapter</button>
        </form>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
