import { useState } from 'react';

const ASSIGNEES = [
  { value: 'jake', label: 'Jake' },
  { value: 'paula', label: 'Paula' },
  { value: 'both', label: 'Both' },
];

export default function QuestForm({ categories, onSubmit }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [difficulty, setDifficulty] = useState(1);
  const [assignee, setAssignee] = useState('jake');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), category, difficulty, assignee });
      setName('');
      setDifficulty(1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="quest-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Quest name"
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
      <button type="submit" disabled={submitting}>Add Quest</button>
    </form>
  );
}
