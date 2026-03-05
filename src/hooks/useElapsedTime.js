import { useState, useEffect } from 'react';

/**
 * Returns the number of seconds elapsed since a server-provided ISO 8601 timestamp.
 * Updates every second. Survives page navigation and refreshes because it anchors
 * to the server timestamp rather than Date.now() at mount time.
 *
 * @param {string|null} startedAt - ISO 8601 string, e.g. "2026-03-05T14:26:40Z"
 * @returns {number} elapsed seconds (0 if startedAt is null/undefined)
 */
const useElapsedTime = (startedAt) => {
  const [elapsed, setElapsed] = useState(() => {
    if (!startedAt) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  });

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }

    const startEpoch = new Date(startedAt).getTime();

    // Set immediately so the value is correct before the first tick
    setElapsed(Math.max(0, Math.floor((Date.now() - startEpoch) / 1000)));

    const interval = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startEpoch) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return elapsed;
};

export default useElapsedTime;
