const CATEGORY_ICONS = { Proactive: '⚔️', Leisure: '🍻', Health: '🛡️' };

function QuestProgress({ quest, onProgressChange }) {
  const target = quest.target_count ?? 1;
  const progress = quest.progress ?? (quest.completed ? target : 0);

  if (target <= 1) {
    return (
      <input
        type="checkbox"
        checked={!!quest.completed}
        onChange={() => onProgressChange(quest, quest.completed ? 0 : 1)}
      />
    );
  }

  return (
    <span className="quest-progress">
      {Array.from({ length: target }, (_, i) => (
        <input
          key={i}
          type="checkbox"
          checked={i < progress}
          onChange={() => onProgressChange(quest, i < progress ? i : i + 1)}
          aria-label={`Session ${i + 1} of ${target}`}
        />
      ))}
      <span className="quest-progress-count">{progress}/{target}</span>
    </span>
  );
}

export default function QuestList({ category, quests, onProgressChange, onDelete }) {
  return (
    <section className="quest-category">
      <h3>{CATEGORY_ICONS[category]} {category}</h3>
      {quests.length === 0 && <p className="muted">No quests yet.</p>}
      <ul>
        {quests.map((q) => (
          <li key={q.id} className={q.completed ? 'completed' : ''}>
            <div className="quest-info">
              <QuestProgress quest={q} onProgressChange={onProgressChange} />
              <span className="quest-name">{q.name}</span>
              <span className="quest-difficulty">{'★'.repeat(q.difficulty)}</span>
            </div>
            <button className="delete-btn" onClick={() => onDelete(q)} aria-label="Delete quest">✕</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
