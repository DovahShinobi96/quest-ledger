const CATEGORY_ICONS = { Proactive: '🧹', Leisure: '🎮', Health: '💪' };

export default function QuestList({ category, quests, onToggle, onDelete }) {
  return (
    <section className="quest-category">
      <h3>{CATEGORY_ICONS[category]} {category}</h3>
      {quests.length === 0 && <p className="muted">No quests yet.</p>}
      <ul>
        {quests.map((q) => (
          <li key={q.id} className={q.completed ? 'completed' : ''}>
            <label>
              <input type="checkbox" checked={!!q.completed} onChange={() => onToggle(q)} />
              <span className="quest-name">{q.name}</span>
              <span className="quest-difficulty">{'★'.repeat(q.difficulty)}</span>
            </label>
            <button className="delete-btn" onClick={() => onDelete(q)} aria-label="Delete quest">✕</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
