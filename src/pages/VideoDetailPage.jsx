import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Snackbar, Alert, Skeleton, Button } from '@mui/material';
import { ArrowBack, VideocamOff } from '@mui/icons-material';
import DetailPageHeader from '../components/detail/DetailPageHeader';
import VideoPlayer from '../components/VideoPlayer';
import MomentsSidebar from '../components/detail/MomentsSidebar';
import InfoTabs from '../components/detail/InfoTabs';
import AddMomentDialog from '../components/AddMomentDialog';
import MomentConfigDrawer from '../components/MomentConfigDrawer';
import UnifiedPipelineModal from '../components/UnifiedPipelineModal';
import PipelineConfirmDialog from '../components/PipelineConfirmDialog';
import {
  getVideo,
  getVideos,
  getMoments,
  getTranscript,
  addMoment,
  deleteMoment,
  startPipeline,
  cancelPipeline,
  getPipelineHistory,
  getClipsForVideo,
} from '../services/api';

const VideoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);

  // Data state
  const [video, setVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [moments, setMoments] = useState([]);
  const [clipMap, setClipMap] = useState({});
  const [transcript, setTranscript] = useState(null);
  const [pipelineHistory, setPipelineHistory] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [addMomentDialogOpen, setAddMomentDialogOpen] = useState(false);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [pipelineModalOpen, setPipelineModalOpen] = useState(false);
  const [pipelineConfirmDialogOpen, setPipelineConfirmDialogOpen] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({});

  // Modal data
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedMomentTitle, setSelectedMomentTitle] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch video data on mount and when ID changes
  useEffect(() => {
    fetchVideoData();
    fetchAllVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  const buildClipMap = (clips) => {
    const map = {};
    clips.forEach(clip => {
      if (clip.moment_identifier) {
        map[clip.moment_identifier] = clip;
      }
    });
    return map;
  };

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [videoData, momentsData, transcriptData, historyData, clipsData] = await Promise.all([
        getVideo(id),
        getMoments(id).catch(() => []),
        getTranscript(id).catch(() => null),
        getPipelineHistory(id).catch(() => []),
        getClipsForVideo(id).catch(() => []),
      ]);

      setVideo(videoData);
      setMoments(momentsData);
      setTranscript(transcriptData);
      setPipelineHistory(historyData);
      setClipMap(buildClipMap(clipsData));
    } catch (err) {
      console.error('Error fetching video data:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const fetchPipelineHistoryData = async () => {
    try {
      const historyData = await getPipelineHistory(id);
      setPipelineHistory(historyData);
    } catch (err) {
      console.error('Error fetching pipeline history:', err);
    }
  };

  const fetchAllVideos = async () => {
    try {
      const videosData = await getVideos();
      setVideos(videosData);
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  const fetchMomentsData = async () => {
    try {
      const [momentsData, clipsData] = await Promise.all([
        getMoments(id),
        getClipsForVideo(id).catch(() => []),
      ]);
      setMoments(momentsData);
      setClipMap(buildClipMap(clipsData));
    } catch (err) {
      console.error('Error fetching moments:', err);
    }
  };

  // Navigation handlers
  const handleBack = () => {
    navigate('/videos');
  };

  const currentIndex = videos.findIndex((v) => v.id === video?.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < videos.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      navigate(`/videos/${videos[currentIndex - 1].id}`);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      navigate(`/videos/${videos[currentIndex + 1].id}`);
    }
  };

  // Time update from video player
  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  // Moment click - seek video
  const handleMomentClick = (startTime) => {
    if (playerRef.current) {
      playerRef.current.seekTo(startTime);
    }
  };

  // Moment play click - seek and start playing
  const handleMomentPlayClick = (startTime) => {
    if (playerRef.current) {
      playerRef.current.seekAndPlay(startTime);
    }
  };

  // Seek to specific time (for transcript tab)
  const handleSeekTo = (time) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time);
    }
  };

  // Add moment handlers
  const handleAddMomentClick = () => {
    setAddMomentDialogOpen(true);
  };

  const handleAddMoment = async (moment) => {
    try {
      await addMoment(id, moment);
      await fetchMomentsData();
      setSnackbar({
        open: true,
        message: 'Moment added successfully!',
        severity: 'success',
      });
    } catch (error) {
      throw error;
    }
  };

  // Delete moment handler
  const handleDeleteMoment = async (moment) => {
    try {
      await deleteMoment(id, moment.id);
      await fetchMomentsData();
      setSnackbar({
        open: true,
        message: 'Moment deleted successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting moment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete moment. Please try again.',
        severity: 'error',
      });
    }
  };

  // Config drawer handlers
  const handleConfigClick = (config, title) => {
    setSelectedConfig(config);
    setSelectedMomentTitle(title);
    setConfigDrawerOpen(true);
  };

  const handleConfigDrawerClose = () => {
    setConfigDrawerOpen(false);
    setTimeout(() => {
      setSelectedConfig(null);
      setSelectedMomentTitle('');
    }, 200);
  };

  // Pipeline handlers
  const handleRunPipelineClick = () => {
    if (moments && moments.length > 0) {
      setConfirmDialogConfig({
        title: 'Moments Already Exist',
        message: `This video already has ${moments.length} moment(s). Do you want to regenerate them?`,
        onConfirm: () => {
          setPipelineConfirmDialogOpen(false);
          setPipelineModalOpen(true);
        }
      });
      setPipelineConfirmDialogOpen(true);
    } else {
      setPipelineModalOpen(true);
    }
  };

  const handleStartPipeline = async (config) => {
    try {
      await startPipeline(id, config);
      
      setPipelineModalOpen(false);
      setSnackbar({
        open: true,
        message: 'Pipeline started successfully!',
        severity: 'success',
      });

      // Refresh history after a delay to allow pipeline to initialize
      setTimeout(() => {
        fetchPipelineHistoryData();
      }, 2000);
    } catch (error) {
      console.error('Error starting pipeline:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to start pipeline';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleCancelPipeline = async () => {
    try {
      await cancelPipeline(id);
      setSnackbar({
        open: true,
        message: 'Pipeline cancellation requested',
        severity: 'info',
      });
      
      setTimeout(() => {
        fetchPipelineHistoryData();
      }, 1000);
    } catch (error) {
      console.error('Error cancelling pipeline:', error);
      setSnackbar({
        open: true,
        message: 'Failed to cancel pipeline',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Error state
  if (error && !loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Back to Video Library
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <DetailPageHeader
        videoTitle={video?.filename || 'Loading...'}
        onBack={handleBack}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        loading={loading}
      />

      {loading ? (
        <Box>
          <Skeleton variant="rectangular" width="100%" height={500} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
        </Box>
      ) : (
        <>
          {/* Two-column layout: Left (Player + Tabs) | Right (Moments Sidebar) */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: 2,
            }}
          >
            {/* Left column: Player + Info Tabs */}
            <Box
              sx={{
                flex: { lg: '1 1 0%' },
                minWidth: 0,
                width: { xs: '100%' },
              }}
            >
              {video?.cloud_url ? (
                <VideoPlayer
                  ref={playerRef}
                  video={video}
                  moments={moments}
                  transcript={transcript}
                  onTimeUpdate={handleTimeUpdate}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  hasPrevious={hasPrevious}
                  hasNext={hasNext}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '16/9',
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                  }}
                >
                  <VideocamOff sx={{ fontSize: 64, color: 'text.disabled' }} />
                  <Typography variant="h6" color="text.secondary">
                    Source video has been removed
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Clips, transcript, and moments are still available.
                  </Typography>
                </Box>
              )}

              {/* Info Tabs directly below the player */}
              <Box sx={{ mt: 2 }}>
                <InfoTabs
                  video={video}
                  moments={moments}
                  clipMap={clipMap}
                  transcript={transcript}
                  currentTime={currentTime}
                  pipelineHistory={pipelineHistory}
                  onRunPipeline={handleRunPipelineClick}
                  // Transcript tab handlers
                  onSeekTo={handleSeekTo}
                  // Pipeline tab handlers
                  onStartPipeline={handleRunPipelineClick}
                  onCancelPipeline={handleCancelPipeline}
                  onRefreshHistory={fetchPipelineHistoryData}
                  isLoadingHistory={loading}
                />
              </Box>
            </Box>

            {/* Right column: Moments Sidebar */}
            <Box
              sx={{
                flex: { lg: '0 0 340px' },
                width: { xs: '100%' },
                height: { lg: 'calc(100vh - 100px)' },
                position: { lg: 'sticky' },
                top: { lg: '80px' },
                alignSelf: { lg: 'flex-start' },
                overflow: { lg: 'hidden' },
              }}
            >
              <MomentsSidebar
                moments={moments}
                clipMap={clipMap}
                currentTime={currentTime}
                onMomentClick={handleMomentClick}
                onMomentPlayClick={handleMomentPlayClick}
                onAddMomentClick={handleAddMomentClick}
                onDeleteMoment={handleDeleteMoment}
                onConfigClick={handleConfigClick}
                hasTranscript={!!transcript}
                loading={loading}
              />
            </Box>
          </Box>
        </>
      )}

      {/* Modals */}
      <AddMomentDialog
        open={addMomentDialogOpen}
        onClose={() => setAddMomentDialogOpen(false)}
        onSave={handleAddMoment}
        videoDuration={video?.duration || 0}
      />

      <MomentConfigDrawer
        open={configDrawerOpen}
        onClose={handleConfigDrawerClose}
        config={selectedConfig}
        momentTitle={selectedMomentTitle}
      />

      <UnifiedPipelineModal
        open={pipelineModalOpen}
        onClose={() => setPipelineModalOpen(false)}
        video={video}
        onStart={handleStartPipeline}
      />

      <PipelineConfirmDialog
        open={pipelineConfirmDialogOpen}
        onClose={setPipelineConfirmDialogOpen}
        onConfirm={confirmDialogConfig.onConfirm}
        title={confirmDialogConfig.title}
        message={confirmDialogConfig.message}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VideoDetailPage;
