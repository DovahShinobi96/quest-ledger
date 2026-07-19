import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

// season: undefined = loading, null = no active season, object = active season
export function useCurrentSeason() {
  const [season, setSeason] = useState(undefined);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => {
    api.getCurrentSeason().then(setSeason).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { season, error, refresh };
}
