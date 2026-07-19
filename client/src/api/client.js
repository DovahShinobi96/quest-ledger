const BASE = '/api';

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getParticipants: () => request('/participants'),
  getCurrentSeason: () => request('/seasons/current'),
  startSeason: (data) => request('/seasons', { method: 'POST', body: JSON.stringify(data) }),
  endSeason: (id) => request(`/seasons/${id}/end`, { method: 'POST' }),
  advanceWeek: (seasonId) => request(`/seasons/${seasonId}/weeks`, { method: 'POST' }),
  getWeek: (id) => request(`/weeks/${id}`),
  addQuest: (weekId, data) => request(`/weeks/${weekId}/quests`, { method: 'POST', body: JSON.stringify(data) }),
  toggleQuest: (id, completed) => request(`/quests/${id}`, { method: 'PATCH', body: JSON.stringify({ completed }) }),
  deleteQuest: (id) => request(`/quests/${id}`, { method: 'DELETE' }),
};
