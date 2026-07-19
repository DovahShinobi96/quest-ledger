import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentSeason } from '../hooks/useCurrentSeason.js';
import { api } from '../api/client.js';
import QuestForm from '../components/QuestForm.jsx';
import QuestList from '../components/QuestList.jsx';

const CATEGORIES = ['Proactive', 'Leisure', 'Health'];
const PEOPLE = [
  { key: 'jake', label: 'Jake' },
  { key: 'paula', label: 'Paula' },
];

export default function ThisWeek() {
  const { season, refresh: refreshSeason } = useCurrentSeason();
  const [week, setWeek] = useState(undefined);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('jake');

  const activeWeekMeta = season?.weeks.find((w) => w.status === 'active');
  const activeWeekId = activeWeekMeta?.id;

  const loadWeek = useCallback(() => {
    if (!activeWeekId) return;
    api.getWeek(activeWeekId).then(setWeek).catch((e) => setError(e.message));
  }, [activeWeekId]);

  useEffect(() => {
    loadWeek();
  }, [loadWeek]);

  const handleAddQuest = async (data) => {
    await api.addQuest(activeWeekId, data);
    loadWeek();
  };

  const handleToggle = async (quest) => {
    await api.toggleQuest(quest.id, !quest.completed);
    loadWeek();
  };

  const handleDelete = async (quest) => {
    await api.deleteQuest(quest.id);
    loadWeek();
  };

  const handleAdvanceWeek = async () => {
    try {
      await api.advanceWeek(season.id);
      refreshSeason();
    } catch (e) {
      setError(e.message);
    }
  };

  if (season === undefined) return <p>Loading…</p>;
  if (season === null) {
    return (
      <div className="empty-state">
        <p>No active season yet.</p>
        <Link to="/seasons" className="button">Start a Season</Link>
      </div>
    );
  }
  if (!week) return <p>Loading week…</p>;

  const canAdvance = season.weeks.length < season.week_count;

  return (
    <div className="this-week">
      <div className="this-week-header">
        <h2>Week {week.week_number} of {season.week_count}</h2>
        <button onClick={handleAdvanceWeek} disabled={!canAdvance}>
          {canAdvance ? 'Advance to Next Week' : 'Final Week'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="week-totals">
        <span>Jake: {week.totals.jake.points} pts, {'★'.repeat(week.totals.jake.difficulty)}</span>
        <span>Paula: {week.totals.paula.points} pts, {'★'.repeat(week.totals.paula.difficulty)}</span>
      </div>

      <div className="person-tabs">
        {PEOPLE.map((person) => (
          <button
            key={person.key}
            className={activeTab === person.key ? 'active' : ''}
            onClick={() => setActiveTab(person.key)}
          >
            {person.label}
          </button>
        ))}
      </div>

      <QuestForm categories={CATEGORIES} defaultAssignee={activeTab} onSubmit={handleAddQuest} />

      {CATEGORIES.map((category) => (
        <QuestList
          key={category}
          category={category}
          quests={week.quests.filter((q) => q.category === category && q.assignee === activeTab)}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
