import { useEffect, useState } from 'react';

const ASSIGNEES = [
  { value: 'jake', label: 'Jake' },
  { value: 'paula', label: 'Paula' },
  { value: 'both', label: 'Both' },
];

export default function QuestForm({ categories, defaultAssignee = 'jake', onSubmit }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [difficulty, setDifficulty] = useState(1);
  const [assignee, setAssignee] = useState(defaultAssignee);
  const [targetCount, setTargetCount] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAssignee(defaultAssignee);
  }, [defaultAssignee]);

  const clampTargetCount = (value) => Math.max(1, Math.min(14, parseInt(value, 10) || 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        category,
        difficulty,
        assignee,
        target_count: clampTargetCount(targetCount),
      });
      setName('');
      setDifficulty(1);
      setTargetCount('1');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="quest-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Inscribe a new quest…"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}>
        {[1, 2, 3, 4, 5].map((d) => (
          <option key={d} value={d}>{'★'.repeat(d)}</option>
        ))}
      </select>
      <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
        {ASSIGNEES.map((a) => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </select>
      <label className="target-count-field">
        ×
        <input
          type="number"
          min={1}
          max={14}
          value={targetCount}
          onChange={(e) => setTargetCount(e.target.value)}
          onBlur={() => setTargetCount(String(clampTargetCount(targetCount)))}
          title="Times to complete this quest before it's done"
        />
      </label>
      <button type="submit" disabled={submitting}>⚔️ Add Quest</button>
    </form>
  );
}
