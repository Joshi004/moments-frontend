import { useState, useEffect, useRef } from 'react';
import { getPipelineStatus } from '../services/api';

/**
 * Custom hook to poll pipeline status for a video.
 * 
 * @param {string} videoId - The video ID to track
 * @param {boolean} isActive - Whether to actively poll for status
 * @returns {Object} { status, currentStage, stages, error, isLoading, totalDuration }
 */
const usePipelineStatus = (videoId, isActive) => {
  const [status, setStatus] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [stages, setStages] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalDuration, setTotalDuration] = useState(null);
  const pollIntervalRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!videoId || !isActive) {
        return;
      }

      try {
        setIsLoading(true);
        const data = await getPipelineStatus(videoId);
        
        if (!mountedRef.current) return;

        setStatus(data.status);
        setCurrentStage(data.current_stage);
        setStages(data.stages || {});
        setTotalDuration(data.total_duration_seconds);
        setError(null);

        // Stop polling if pipeline has finished
        if (data.status === 'completed' || 
            data.status === 'failed' || 
            data.status === 'cancelled' ||
            data.status === 'never_run' ||
            data.status === 'not_running') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error('Error fetching pipeline status:', err);
        if (mountedRef.current) {
          setError(err.message || 'Failed to fetch pipeline status');
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    if (isActive && videoId) {
      // Fetch immediately
      fetchStatus();

      // Set up polling interval (every 2 seconds)
      pollIntervalRef.current = setInterval(fetchStatus, 2000);
    } else {
      // Clear interval if not active
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [videoId, isActive]);

  return {
    status,
    currentStage,
    stages,
    error,
    isLoading,
    totalDuration,
  };
};

export default usePipelineStatus;





