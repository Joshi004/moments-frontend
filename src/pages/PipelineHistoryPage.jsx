import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack,
  Search,
  ExpandMore,
  CheckCircle,
  Error,
  Cancel,
  HourglassEmpty,
  Refresh,
} from '@mui/icons-material';
import { getPipelineStatus, getPipelineHistory } from '../services/api';

const formatDuration = (seconds) => {
  if (!seconds) return '';
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp * 1000);
  const now = Date.now();
  const diff = now - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return <CheckCircle color="success" />;
    case 'failed':
      return <Error color="error" />;
    case 'cancelled':
      return <Cancel color="warning" />;
    case 'processing':
    case 'queued':
      return <HourglassEmpty color="primary" />;
    default:
      return <HourglassEmpty />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'error';
    case 'cancelled':
      return 'warning';
    case 'processing':
    case 'queued':
      return 'primary';
    default:
      return 'default';
  }
};

const PipelineHistoryPage = () => {
  const navigate = useNavigate();
  const [searchVideoId, setSearchVideoId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recentPipelines, setRecentPipelines] = useState([]);

  // Load recent pipelines from localStorage
  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentPipelineVideos') || '[]');
      setRecentPipelines(recent);
    } catch (err) {
      console.error('Failed to load recent pipelines:', err);
    }
  }, []);

  const handleSearch = async () => {
    if (!searchVideoId.trim()) {
      setSearchError('Please enter a video ID');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const status = await getPipelineStatus(searchVideoId.trim());
      setSearchResult(status);
    } catch (err) {
      console.error('Error fetching pipeline status:', err);
      setSearchError(err.response?.data?.detail || err.message || 'Failed to fetch pipeline status');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const renderStagesList = (stages) => {
    if (!stages) return null;

    const stageEntries = Object.entries(stages);
    if (stageEntries.length === 0) return null;

    return (
      <List dense>
        {stageEntries.map(([stageName, stageData]) => (
          <ListItem key={stageName}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">{stageName}</Typography>
                  <Chip 
                    label={stageData.status} 
                    size="small" 
                    color={getStatusColor(stageData.status)}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              }
              secondary={
                <>
                  {stageData.duration_seconds && (
                    <Typography variant="caption" display="block">
                      Duration: {formatDuration(stageData.duration_seconds)}
                    </Typography>
                  )}
                  {stageData.skip_reason && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Skipped: {stageData.skip_reason}
                    </Typography>
                  )}
                  {stageData.error && (
                    <Typography variant="caption" color="error" display="block">
                      Error: {stageData.error}
                    </Typography>
                  )}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderPipelineDetails = (pipeline) => {
    return (
      <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {getStatusIcon(pipeline.status)}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{pipeline.video_id}</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
              <Chip 
                label={pipeline.status.toUpperCase()} 
                size="small" 
                color={getStatusColor(pipeline.status)}
              />
              <Chip label={`Model: ${pipeline.model}`} size="small" variant="outlined" />
              {pipeline.total_duration_seconds && (
                <Chip 
                  label={`Duration: ${formatDuration(pipeline.total_duration_seconds)}`} 
                  size="small" 
                  variant="outlined" 
                />
              )}
            </Box>
          </Box>
        </Box>

        {pipeline.error_message && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {pipeline.error_message}
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">Stage Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {renderStagesList(pipeline.stages)}
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Request ID: {pipeline.request_id}
          </Typography>
        </Box>
      </Paper>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate('/')} size="small">
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Pipeline History
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Search for pipeline status by video ID or browse recent pipelines
        </Typography>
      </Box>

      {/* Search Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Search by Video ID
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Enter video ID (e.g., 08-projectupdatevideo)"
            value={searchVideoId}
            onChange={(e) => setSearchVideoId(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSearching}
            error={!!searchError}
            helperText={searchError}
          />
          <Button
            variant="contained"
            startIcon={isSearching ? <CircularProgress size={20} /> : <Search />}
            onClick={handleSearch}
            disabled={isSearching || !searchVideoId.trim()}
            sx={{ minWidth: 120 }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </Box>

        {searchResult && (
          <Box sx={{ mt: 3 }}>
            {renderPipelineDetails(searchResult)}
          </Box>
        )}
      </Paper>

      {/* Recent Pipelines */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Recent Pipelines
          </Typography>
          <Button
            startIcon={<Refresh />}
            size="small"
            onClick={() => {
              const recent = JSON.parse(localStorage.getItem('recentPipelineVideos') || '[]');
              setRecentPipelines(recent);
            }}
          >
            Refresh
          </Button>
        </Box>

        {recentPipelines.length === 0 ? (
          <Alert severity="info">
            No recent pipelines found. Start a pipeline to see it here.
          </Alert>
        ) : (
          <List>
            {recentPipelines.map((pipeline, index) => (
              <React.Fragment key={pipeline.request_id || index}>
                <ListItem
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    borderRadius: 1,
                  }}
                  onClick={() => {
                    setSearchVideoId(pipeline.video_id);
                    handleSearch();
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={500}>
                        {pipeline.video_id}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(pipeline.timestamp / 1000)}
                        </Typography>
                        {pipeline.url && (
                          <Typography variant="caption" color="text.secondary">
                            • {pipeline.url.substring(0, 50)}...
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < recentPipelines.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default PipelineHistoryPage;

