import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentSeason } from '../hooks/useCurrentSeason.js';
import { api } from '../api/client.js';
import { getLevelProgress } from '../lib/leveling.js';
import ProgressBar from '../components/ProgressBar.jsx';

export default function Dashboard() {
  const { season, error } = useCurrentSeason();
  const [stats, setStats] = useState(undefined);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
  }, []);

  const lastWeekWinner = useMemo(() => {
    if (!season) return null;
    const completedWeeks = season.weeks.filter((w) => w.status === 'completed');
    if (completedWeeks.length === 0) return null;
    const last = completedWeeks[completedWeeks.length - 1];
    const { jake, paula } = last.totals;
    const winner = jake.points === paula.points ? 'Draw' : jake.points > paula.points ? 'Jake' : 'Paula';
    return { week: last.week_number, winner };
  }, [season]);

  if (error) return <p className="error">Error: {error}</p>;
  if (season === undefined) return <p>Loading…</p>;
  if (season === null) {
    return (
      <div className="empty-state">
        <p>No chapter is underway yet.</p>
        <Link to="/seasons" className="button">📖 Begin a New Chapter</Link>
      </div>
    );
  }

  const { jake, paula } = season.totals;
  const maxPts = Math.max(jake.points, paula.points, 1);
  const activeWeek = season.weeks.find((w) => w.status === 'active');
  const leader = jake.points === paula.points ? null : jake.points > paula.points ? 'Jake' : 'Paula';

  return (
    <div className="dashboard">
      <h2>{season.name || `Season ${season.number}`}</h2>

      <ProgressBar label="Jake" value={jake.points} max={maxPts} highlight={leader === 'Jake'} />
      <ProgressBar label="Paula" value={paula.points} max={maxPts} highlight={leader === 'Paula'} />

      <p className="leader-line">Current Leader: {leader ? `👑 ${leader}` : 'Tied'}</p>

      <p>Week {activeWeek ? activeWeek.week_number : season.weeks.length} of {season.week_count}</p>

      <div className="stat-grid">
        <div className="stat-card">
          <h3>Difficulty This Season</h3>
          <p>Jake: {'★'.repeat(Math.min(jake.difficulty, 30))} ({jake.difficulty})</p>
          <p>Paula: {'★'.repeat(Math.min(paula.difficulty, 30))} ({paula.difficulty})</p>
        </div>
        {lastWeekWinner && (
          <div className="stat-card">
            <h3>Last Week's Winner</h3>
            <p>Week {lastWeekWinner.week}: {lastWeekWinner.winner}</p>
          </div>
        )}
      </div>

      {stats && (
        <div className="stat-card">
          <h3>Levels</h3>
          {['jake', 'paula'].map((who) => {
            const { level, pointsIntoLevel, pointsForNextLevel } = getLevelProgress(stats.lifetime[who].points);
            const label = `${who === 'jake' ? 'Jake' : 'Paula'} — Level ${level}`;
            return (
              <ProgressBar
                key={who}
                label={label}
                value={pointsIntoLevel}
                max={pointsForNextLevel}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
