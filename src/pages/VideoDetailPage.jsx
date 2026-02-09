import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Snackbar, Alert, Skeleton, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import DetailPageHeader from '../components/detail/DetailPageHeader';
import VideoPlayer from '../components/VideoPlayer';
import MomentsSidebar from '../components/detail/MomentsSidebar';
import GenerateMomentsModal from '../components/GenerateMomentsModal';
import AddMomentDialog from '../components/AddMomentDialog';
import RefineMomentModal from '../components/RefineMomentModal';
import ExtractClipsModal from '../components/ExtractClipsModal';
import MomentConfigDrawer from '../components/MomentConfigDrawer';
import {
  getVideo,
  getVideos,
  getMoments,
  getTranscript,
  addMoment,
  deleteMoment,
  generateMoments,
  getGenerationStatus,
  refineMoment,
  getRefinementStatus,
  extractClips,
  getClipExtractionStatus,
} from '../services/api';

const VideoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data state
  const [video, setVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [moments, setMoments] = useState([]);
  const [transcript, setTranscript] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [addMomentDialogOpen, setAddMomentDialogOpen] = useState(false);
  const [refineModalOpen, setRefineModalOpen] = useState(false);
  const [extractClipsModalOpen, setExtractClipsModalOpen] = useState(false);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);

  // Modal data
  const [momentToRefine, setMomentToRefine] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedMomentTitle, setSelectedMomentTitle] = useState('');

  // Processing states
  const [isGeneratingMoments, setIsGeneratingMoments] = useState(false);
  const [generationPollInterval, setGenerationPollInterval] = useState(null);
  const [isRefiningMoment, setIsRefiningMoment] = useState(false);
  const [refinementPollInterval, setRefinementPollInterval] = useState(null);
  const [isExtractingClips, setIsExtractingClips] = useState(false);
  const [extractionPollInterval, setExtractionPollInterval] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch video data on mount and when ID changes
  useEffect(() => {
    fetchVideoData();
    fetchAllVideos();
  }, [id]);

  // Cleanup polling intervals on unmount
  useEffect(() => {
    return () => {
      if (generationPollInterval) clearInterval(generationPollInterval);
      if (refinementPollInterval) clearInterval(refinementPollInterval);
      if (extractionPollInterval) clearInterval(extractionPollInterval);
    };
  }, [generationPollInterval, refinementPollInterval, extractionPollInterval]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [videoData, momentsData, transcriptData] = await Promise.all([
        getVideo(id),
        getMoments(id).catch(() => []),
        getTranscript(id).catch(() => null),
      ]);

      setVideo(videoData);
      setMoments(momentsData);
      setTranscript(transcriptData);
    } catch (err) {
      console.error('Error fetching video data:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load video');
    } finally {
      setLoading(false);
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
      const momentsData = await getMoments(id);
      setMoments(momentsData);
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
    setCurrentTime(startTime);
    // The VideoPlayer will respond to this via its own useEffect watching currentTime
    // But we need a way to actually seek - we'll handle this differently
    // For now, this is a limitation - we'd need to expose a ref or callback
  };

  // Generate moments handlers
  const handleGenerateClick = () => {
    setGenerateModalOpen(true);
  };

  const handleGenerateMoments = async (config) => {
    try {
      setIsGeneratingMoments(true);
      setSnackbar({ open: false, message: '', severity: 'info' });

      await generateMoments(id, config);

      const pollInterval = setInterval(async () => {
        try {
          const status = await getGenerationStatus(id);

          if (status && status.status === 'completed') {
            clearInterval(pollInterval);
            setGenerationPollInterval(null);
            setIsGeneratingMoments(false);
            setGenerateModalOpen(false);

            await fetchMomentsData();

            setSnackbar({
              open: true,
              message: 'Moments generated successfully!',
              severity: 'success',
            });
          } else if (status && status.status === 'failed') {
            clearInterval(pollInterval);
            setGenerationPollInterval(null);
            setIsGeneratingMoments(false);

            setSnackbar({
              open: true,
              message: 'Moment generation failed. Please try again.',
              severity: 'error',
            });
          }
        } catch (error) {
          console.error('Error polling generation status:', error);
        }
      }, 2000);

      setGenerationPollInterval(pollInterval);

      setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval);
          setGenerationPollInterval(null);
          if (isGeneratingMoments) {
            setIsGeneratingMoments(false);
            setSnackbar({
              open: true,
              message: 'Generation timeout. Please check the status.',
              severity: 'warning',
            });
          }
        }
      }, 5 * 60 * 1000);
    } catch (error) {
      console.error('Error generating moments:', error);
      setIsGeneratingMoments(false);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to start moment generation';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
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

  // Refine moment handlers
  const handleRefineClick = (moment) => {
    setMomentToRefine(moment);
    setRefineModalOpen(true);
  };

  const handleRefineMoment = async (config) => {
    if (!momentToRefine) return;

    try {
      setIsRefiningMoment(true);
      setSnackbar({ open: false, message: '', severity: 'info' });

      await refineMoment(id, momentToRefine.id, config);

      const pollInterval = setInterval(async () => {
        try {
          const status = await getRefinementStatus(id, momentToRefine.id);

          if (status && status.status === 'completed') {
            clearInterval(pollInterval);
            setRefinementPollInterval(null);
            setIsRefiningMoment(false);
            setRefineModalOpen(false);
            setMomentToRefine(null);

            await fetchMomentsData();

            setSnackbar({
              open: true,
              message: 'Moment refined successfully!',
              severity: 'success',
            });
          } else if (status && status.status === 'failed') {
            clearInterval(pollInterval);
            setRefinementPollInterval(null);
            setIsRefiningMoment(false);

            setSnackbar({
              open: true,
              message: 'Moment refinement failed. Please try again.',
              severity: 'error',
            });
          }
        } catch (error) {
          console.error('Error polling refinement status:', error);
        }
      }, 2000);

      setRefinementPollInterval(pollInterval);

      setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval);
          setRefinementPollInterval(null);
          if (isRefiningMoment) {
            setIsRefiningMoment(false);
            setSnackbar({
              open: true,
              message: 'Refinement timeout. Please check the status.',
              severity: 'warning',
            });
          }
        }
      }, 5 * 60 * 1000);
    } catch (error) {
      console.error('Error refining moment:', error);
      setIsRefiningMoment(false);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to start moment refinement';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
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

  // Extract clips handlers
  const handleExtractClipsClick = () => {
    setExtractClipsModalOpen(true);
  };

  const handleExtractClips = async (config) => {
    try {
      setIsExtractingClips(true);
      setSnackbar({ open: false, message: '', severity: 'info' });

      await extractClips(id, config);

      const pollInterval = setInterval(async () => {
        try {
          const status = await getClipExtractionStatus(id);

          if (status && status.status === 'completed') {
            clearInterval(pollInterval);
            setExtractionPollInterval(null);
            setIsExtractingClips(false);
            setExtractClipsModalOpen(false);

            const successMsg = status.processed_moments
              ? `Successfully extracted ${status.processed_moments - status.failed_moments} clips (${status.failed_moments} failed)`
              : 'Clips extracted successfully!';

            setSnackbar({
              open: true,
              message: successMsg,
              severity: 'success',
            });
          } else if (status && status.status === 'failed') {
            clearInterval(pollInterval);
            setExtractionPollInterval(null);
            setIsExtractingClips(false);

            setSnackbar({
              open: true,
              message: 'Clip extraction failed. Please try again.',
              severity: 'error',
            });
          }
        } catch (error) {
          console.error('Error polling extraction status:', error);
        }
      }, 2000);

      setExtractionPollInterval(pollInterval);

      setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval);
          setExtractionPollInterval(null);
          if (isExtractingClips) {
            setIsExtractingClips(false);
            setSnackbar({
              open: true,
              message: 'Extraction timeout. Please check the status.',
              severity: 'warning',
            });
          }
        }
      }, 10 * 60 * 1000);
    } catch (error) {
      console.error('Error extracting clips:', error);
      setIsExtractingClips(false);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to start clip extraction';
      setSnackbar({
        open: true,
        message: errorMessage,
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

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Error state
  if (error && !loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
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
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
          {/* Two-column layout: Player + Sidebar */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: 2,
              mb: 3,
            }}
          >
            {/* Player - 65% on desktop */}
            <Box sx={{ flex: { lg: '0 0 65%' }, width: { xs: '100%' } }}>
              <VideoPlayer
                video={video}
                moments={moments}
                transcript={transcript}
                onTimeUpdate={handleTimeUpdate}
                onPrevious={handlePrevious}
                onNext={handleNext}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
              />
            </Box>

            {/* Sidebar - 35% on desktop */}
            <Box
              sx={{
                flex: { lg: '0 0 35%' },
                width: { xs: '100%' },
                maxHeight: { lg: 'calc(100vh - 200px)' },
              }}
            >
              <MomentsSidebar
                moments={moments}
                currentTime={currentTime}
                onMomentClick={handleMomentClick}
                onGenerateClick={handleGenerateClick}
                onAddMomentClick={handleAddMomentClick}
                onRefineClick={handleRefineClick}
                onDeleteMoment={handleDeleteMoment}
                onExtractClipsClick={handleExtractClipsClick}
                onConfigClick={handleConfigClick}
                hasTranscript={!!transcript}
                loading={loading}
              />
            </Box>
          </Box>

          {/* Phase 4 placeholder */}
          <Box
            sx={{
              mt: 3,
              p: 3,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography color="text.secondary">
              Info tabs coming in Phase 4 (Overview, Transcript, Pipeline, Clips)
            </Typography>
          </Box>
        </>
      )}

      {/* Modals */}
      <GenerateMomentsModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        onGenerate={handleGenerateMoments}
        video={video}
        isGenerating={isGeneratingMoments}
      />

      <AddMomentDialog
        open={addMomentDialogOpen}
        onClose={() => setAddMomentDialogOpen(false)}
        onSave={handleAddMoment}
        videoDuration={video?.duration || 0}
      />

      <RefineMomentModal
        open={refineModalOpen}
        onClose={() => {
          if (!isRefiningMoment) {
            setRefineModalOpen(false);
            setMomentToRefine(null);
          }
        }}
        onRefine={handleRefineMoment}
        moment={momentToRefine}
        isRefining={isRefiningMoment}
        videoId={id}
      />

      <ExtractClipsModal
        open={extractClipsModalOpen}
        onClose={() => {
          if (!isExtractingClips) {
            setExtractClipsModalOpen(false);
          }
        }}
        onExtract={handleExtractClips}
        video={video}
        isExtracting={isExtractingClips}
      />

      <MomentConfigDrawer
        open={configDrawerOpen}
        onClose={handleConfigDrawerClose}
        config={selectedConfig}
        momentTitle={selectedMomentTitle}
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
    </Container>
  );
};

export default VideoDetailPage;
