export default function ProgressBar({ label, value, max, highlight }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={`progress-row ${highlight ? 'leader' : ''}`}>
      <div className="progress-label">
        <span>{label}</span>
        <span>{value} pts</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
