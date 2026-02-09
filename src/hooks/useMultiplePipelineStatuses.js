import { useState, useEffect, useRef, useCallback } from 'react';
import { getPipelineStatus } from '../services/api';

/**
 * Custom hook to poll pipeline status for multiple videos simultaneously.
 * 
 * @param {Array<string>} initialVideoIds - Initial array of video IDs to track
 * @param {number} pollInterval - Polling interval in milliseconds (default: 3000)
 * @returns {Object} { statuses, isPolling, addVideoId, removeVideoId, error }
 */
const useMultiplePipelineStatuses = (initialVideoIds = [], pollInterval = 3000) => {
  const [statuses, setStatuses] = useState(new Map());
  const [trackedVideoIds, setTrackedVideoIds] = useState(new Set(initialVideoIds));
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  
  const pollIntervalRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const addVideoId = useCallback((videoId) => {
    setTrackedVideoIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(videoId);
      return newSet;
    });
  }, []);

  const removeVideoId = useCallback((videoId) => {
    setTrackedVideoIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(videoId);
      return newSet;
    });
    setStatuses((prev) => {
      const newMap = new Map(prev);
      newMap.delete(videoId);
      return newMap;
    });
  }, []);

  const fetchStatuses = useCallback(async () => {
    if (trackedVideoIds.size === 0) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    const videoIdsArray = Array.from(trackedVideoIds);

    try {
      // Fetch all statuses in parallel
      const statusPromises = videoIdsArray.map((videoId) =>
        getPipelineStatus(videoId)
          .then((status) => ({ videoId, status, success: true }))
          .catch((err) => {
            console.warn(`Failed to fetch pipeline status for ${videoId}:`, err);
            return { videoId, success: false };
          })
      );

      const results = await Promise.allSettled(statusPromises);

      if (!mountedRef.current) return;

      const newStatuses = new Map();
      const idsToRemove = new Set();

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          const { videoId, status } = result.value;
          
          // Check if pipeline has reached a terminal state
          const isTerminal = 
            status.status === 'completed' ||
            status.status === 'failed' ||
            status.status === 'cancelled' ||
            status.status === 'never_run' ||
            status.status === 'not_running';

          if (isTerminal) {
            // Mark for removal from tracking
            idsToRemove.add(videoId);
          } else {
            // Keep tracking this video
            newStatuses.set(videoId, status);
          }
        }
      });

      setStatuses(newStatuses);

      // Remove terminal pipelines from tracking
      if (idsToRemove.size > 0) {
        setTrackedVideoIds((prev) => {
          const newSet = new Set(prev);
          idsToRemove.forEach((id) => newSet.delete(id));
          return newSet;
        });
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching multiple pipeline statuses:', err);
      if (mountedRef.current) {
        setError(err.message || 'Failed to fetch pipeline statuses');
      }
    } finally {
      if (mountedRef.current) {
        setIsPolling(trackedVideoIds.size > 0);
      }
    }
  }, [trackedVideoIds]);

  useEffect(() => {
    if (trackedVideoIds.size === 0) {
      // No videos to track, clear interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setIsPolling(false);
      return;
    }

    // Fetch immediately
    fetchStatuses();

    // Set up polling interval
    pollIntervalRef.current = setInterval(fetchStatuses, pollInterval);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [trackedVideoIds, pollInterval, fetchStatuses]);

  return {
    statuses,
    isPolling,
    addVideoId,
    removeVideoId,
    error,
  };
};

export default useMultiplePipelineStatuses;
