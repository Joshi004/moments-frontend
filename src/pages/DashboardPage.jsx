import React, { useState, useEffect } from 'react';
import { Box, Grid, Skeleton, Alert } from '@mui/material';
import { VideoLibrary, AutoAwesome, Timeline, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/dashboard/StatCard';
import QuickActions from '../components/dashboard/QuickActions';
import ActivePipelinesWidget from '../components/dashboard/ActivePipelinesWidget';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import { getVideos, getPipelineStatus, checkHealth } from '../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  
  const [videos, setVideos] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [activePipelines, setActivePipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch videos and health in parallel
      const [videosResult, healthResult] = await Promise.allSettled([
        getVideos(),
        checkHealth(),
      ]);

      const videosData = videosResult.status === 'fulfilled' ? videosResult.value : [];
      const healthData = healthResult.status === 'fulfilled' ? healthResult.value : { status: 'error' };

      setVideos(videosData);
      setHealthStatus(healthData);

      // Scan for active pipelines across all videos
      if (videosData.length > 0) {
        const statusChecks = videosData.map(v =>
          getPipelineStatus(v.id)
            .then(s => ({ videoId: v.id, ...s }))
            .catch(() => null)
        );

        const results = await Promise.allSettled(statusChecks);
        const active = results
          .filter(r => r.status === 'fulfilled' && r.value)
          .map(r => r.value)
          .filter(s => s && ['processing', 'queued', 'pending'].includes(s.status));

        setActivePipelines(active);
      }

      if (videosResult.status === 'rejected') {
        setError('Failed to load videos. Make sure the backend server is running.');
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Derived stats
  const totalVideos = videos.length;
  const totalMoments = videos.reduce((sum, v) => sum + (v.moments?.length || 0), 0);
  const activePipelineCount = activePipelines.length;
  const isHealthy = healthStatus?.status !== 'error';
  const healthValue = isHealthy ? 'Healthy' : 'Error';

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="System overview and quick actions"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Row 1: Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          ) : (
            <StatCard
              icon={<VideoLibrary sx={{ fontSize: 32 }} />}
              title="Total Videos"
              value={totalVideos}
              color="primary"
              onClick={() => navigate('/videos')}
            />
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          ) : (
            <StatCard
              icon={<AutoAwesome sx={{ fontSize: 32 }} />}
              title="Total Moments"
              value={totalMoments}
              color="secondary"
              onClick={() => navigate('/videos')}
            />
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          ) : (
            <StatCard
              icon={<Timeline sx={{ fontSize: 32 }} />}
              title="Active Pipelines"
              value={activePipelineCount}
              color="warning"
              onClick={() => navigate('/pipelines')}
            />
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          ) : (
            <StatCard
              icon={<CheckCircle sx={{ fontSize: 32 }} />}
              title="System Health"
              value={healthValue}
              color={isHealthy ? 'success' : 'error'}
              onClick={() => navigate('/settings')}
            />
          )}
        </Grid>
      </Grid>

      {/* Row 2: Quick Actions */}
      <Box sx={{ mb: 3 }}>
        {loading ? (
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
        ) : (
          <QuickActions />
        )}
      </Box>

      {/* Row 3: Active Pipelines + Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {loading ? (
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          ) : (
            <ActivePipelinesWidget
              videos={videos}
              initialActivePipelines={activePipelines}
            />
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          {loading ? (
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          ) : (
            <RecentActivityFeed videos={videos} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
