import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, Grid, Alert, Button, Chip, Skeleton } from '@mui/material';
import { Timeline, Refresh } from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import ActivePipelineCard from '../components/pipelines/ActivePipelineCard';
import PipelineHistoryTable from '../components/pipelines/PipelineHistoryTable';
import { getVideos, getPipelineStatus, getPipelineHistory, cancelPipeline } from '../services/api';

const PipelineMonitorPage = () => {
  const [videos, setVideos] = useState([]);
  const [activePipelines, setActivePipelines] = useState([]);
  const [pipelineHistory, setPipelineHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Fetch all videos
      const videosData = await getVideos();
      setVideos(videosData);

      // Step 2: Check pipeline status for each video
      const statusPromises = videosData.map((video) =>
        getPipelineStatus(video.id)
          .then((status) => ({ videoId: video.id, status, success: true }))
          .catch(() => ({ videoId: video.id, success: false }))
      );

      const statusResults = await Promise.allSettled(statusPromises);

      // Extract active pipelines
      const active = [];
      statusResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          const { videoId, status } = result.value;
          if (['processing', 'queued', 'pending'].includes(status.status)) {
            active.push({
              ...status,
              video_id: videoId,
            });
          }
        }
      });

      setActivePipelines(active);
      setLoading(false);

      // Step 3: Fetch pipeline history for all videos (in background)
      loadHistory(videosData);
    } catch (err) {
      console.error('Error loading pipeline monitor data:', err);
      setError(err.message || 'Failed to load pipeline data');
      setLoading(false);
      setHistoryLoading(false);
    }
  }, []);

  // Load pipeline history
  const loadHistory = async (videosData) => {
    try {
      setHistoryLoading(true);

      const historyPromises = videosData.map((video) =>
        getPipelineHistory(video.id)
          .then((history) => ({
            videoId: video.id,
            history: Array.isArray(history) ? history : [],
            success: true,
          }))
          .catch(() => ({
            videoId: video.id,
            history: [],
            success: false,
          }))
      );

      const historyResults = await Promise.allSettled(historyPromises);

      // Flatten all history entries
      const allHistory = [];
      historyResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          const { videoId, history } = result.value;
          history.forEach((run) => {
            allHistory.push({
              ...run,
              video_id: videoId,
            });
          });
        }
      });

      // Sort by start time (newest first)
      allHistory.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

      setPipelineHistory(allHistory);
      setHistoryLoading(false);
    } catch (err) {
      console.error('Error loading pipeline history:', err);
      setHistoryLoading(false);
    }
  };

  // Poll active pipelines
  const pollActivePipelines = useCallback(async () => {
    if (activePipelines.length === 0) return;

    try {
      const statusPromises = activePipelines.map((pipeline) =>
        getPipelineStatus(pipeline.video_id)
          .then((status) => ({ videoId: pipeline.video_id, status, success: true }))
          .catch(() => ({ videoId: pipeline.video_id, success: false }))
      );

      const results = await Promise.allSettled(statusPromises);

      const updatedActive = [];
      const completedVideoIds = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          const { videoId, status } = result.value;

          if (['processing', 'queued', 'pending'].includes(status.status)) {
            updatedActive.push({
              ...status,
              video_id: videoId,
            });
          } else {
            // Pipeline completed/failed/cancelled
            completedVideoIds.push(videoId);
          }
        }
      });

      setActivePipelines(updatedActive);

      // Refetch history for completed pipelines
      if (completedVideoIds.length > 0) {
        completedVideoIds.forEach(async (videoId) => {
          try {
            const history = await getPipelineHistory(videoId);
            if (Array.isArray(history) && history.length > 0) {
              setPipelineHistory((prev) => {
                // Remove old entries for this video and add new ones
                const filtered = prev.filter((item) => item.video_id !== videoId);
                const newEntries = history.map((run) => ({ ...run, video_id: videoId }));
                const combined = [...newEntries, ...filtered];
                combined.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
                return combined;
              });
            }
          } catch (err) {
            console.warn(`Failed to refresh history for ${videoId}:`, err);
          }
        });
      }
    } catch (err) {
      console.error('Error polling active pipelines:', err);
    }
  }, [activePipelines]);

  // Set up polling for active pipelines
  useEffect(() => {
    if (activePipelines.length > 0) {
      const interval = setInterval(pollActivePipelines, 3000);
      setPollingInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [activePipelines.length, pollActivePipelines]);

  // Handle pipeline cancellation
  const handleCancelPipeline = async (videoId) => {
    try {
      await cancelPipeline(videoId);
      // Remove from active pipelines immediately
      setActivePipelines((prev) => prev.filter((p) => p.video_id !== videoId));
      // Refetch history for this video
      const history = await getPipelineHistory(videoId);
      if (Array.isArray(history) && history.length > 0) {
        setPipelineHistory((prev) => {
          const filtered = prev.filter((item) => item.video_id !== videoId);
          const newEntries = history.map((run) => ({ ...run, video_id: videoId }));
          const combined = [...newEntries, ...filtered];
          combined.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
          return combined;
        });
      }
    } catch (err) {
      console.error('Error cancelling pipeline:', err);
      alert(`Failed to cancel pipeline: ${err.message}`);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create video info map for active pipelines
  const videoInfoMap = {};
  videos.forEach((video) => {
    videoInfoMap[video.id] = video;
  });

  return (
    <Box>
      <PageHeader
        title="Pipeline Monitor"
        subtitle="Track active and historical pipeline runs"
        actions={
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
          <Button size="small" onClick={loadData} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Section 1: Active Pipelines */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Timeline />
          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
            Active Pipelines
          </Typography>
          {activePipelines.length > 0 && (
            <Chip label={activePipelines.length} color="primary" size="small" />
          )}
        </Box>

        {loading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 2 }).map((_, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Paper sx={{ p: 2 }}>
                  <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : activePipelines.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Timeline sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No pipelines currently running
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {activePipelines.map((pipeline) => (
              <Grid item xs={12} md={6} key={pipeline.video_id}>
                <ActivePipelineCard
                  pipelineStatus={pipeline}
                  videoInfo={videoInfoMap[pipeline.video_id]}
                  onCancel={handleCancelPipeline}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Section 2: Pipeline History */}
      <PipelineHistoryTable
        historyData={pipelineHistory}
        videos={videos}
        loading={historyLoading}
      />
    </Box>
  );
};

export default PipelineMonitorPage;
