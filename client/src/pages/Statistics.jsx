import { useEffect, useState } from 'react';
import {
  CartesianGrid, Legend, Line, LineChart, Bar, BarChart,
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { api } from '../api/client.js';

const CATEGORIES = ['Productive', 'Hobbies', 'Health'];
const JAKE = 'var(--series-jake)';
const PAULA = 'var(--series-paula)';
const GRID = 'var(--border)';
const TICK = { fill: 'var(--muted)', fontSize: 12 };

export default function Statistics() {
  const [stats, setStats] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">Error: {error}</p>;
  if (stats === undefined) return <p>Loading…</p>;

  const pointsData = stats.weeklyHistory.map((w) => ({
    label: w.label,
    jake: w.totals.jake.points,
    paula: w.totals.paula.points,
  }));
  const difficultyData = stats.weeklyHistory.map((w) => ({
    label: w.label,
    jake: w.totals.jake.difficulty,
    paula: w.totals.paula.difficulty,
  }));
  const categoryData = CATEGORIES.map((category) => ({
    category,
    jake: stats.categoryTotals.jake[category],
    paula: stats.categoryTotals.paula[category],
  }));

  if (stats.weeklyHistory.length === 0) {
    return (
      <div className="statistics">
        <p className="empty-state">No completed weeks yet — stats will show up here once a season gets going.</p>
      </div>
    );
  }

  return (
    <div className="statistics">
      <section className="stat-card">
        <h3>Weekly Points Over Time</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={pointsData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="0" vertical={false} />
            <XAxis dataKey="label" tick={TICK} axisLine={{ stroke: GRID }} tickLine={false} />
            <YAxis allowDecimals={false} tick={TICK} axisLine={{ stroke: GRID }} tickLine={false} width={28} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Line type="monotone" dataKey="jake" name="Jake" stroke={JAKE} strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="paula" name="Paula" stroke={PAULA} strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="stat-card">
        <h3>Category Performance</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={categoryData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="0" vertical={false} />
            <XAxis dataKey="category" tick={TICK} axisLine={{ stroke: GRID }} tickLine={false} />
            <YAxis allowDecimals={false} tick={TICK} axisLine={{ stroke: GRID }} tickLine={false} width={28} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar dataKey="jake" name="Jake" fill={JAKE} radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Bar dataKey="paula" name="Paula" fill={PAULA} radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="stat-card">
        <h3>Difficulty Trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={difficultyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="0" vertical={false} />
            <XAxis dataKey="label" tick={TICK} axisLine={{ stroke: GRID }} tickLine={false} />
            <YAxis allowDecimals={false} tick={TICK} axisLine={{ stroke: GRID }} tickLine={false} width={28} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Line type="monotone" dataKey="jake" name="Jake" stroke={JAKE} strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="paula" name="Paula" stroke={PAULA} strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="stat-card">
        <h3>Category Radar</h3>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={categoryData} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
            <PolarGrid stroke={GRID} />
            <PolarAngleAxis dataKey="category" tick={TICK} />
            <PolarRadiusAxis allowDecimals={false} tick={TICK} axisLine={false} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Radar name="Jake" dataKey="jake" stroke={JAKE} fill={JAKE} fillOpacity={0.1} strokeWidth={2} />
            <Radar name="Paula" dataKey="paula" stroke={PAULA} fill={PAULA} fillOpacity={0.1} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
