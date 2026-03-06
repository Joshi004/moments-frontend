import React, { useState } from 'react';
import { Paper, Box, Typography, IconButton, Menu, MenuItem, Divider, Chip, Stack, Skeleton } from '@mui/material';
import { PlayCircleOutline, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useThumbnailUrl from '../../hooks/useThumbnailUrl';
import PipelineStatusBadge from '../PipelineStatusBadge';
import { formatDuration } from '../../utils/formatters';

/**
 * VideoListItem component - horizontal list view for videos
 */
function VideoListItem({ 
  video,
  onProcessPipelineClick, 
  onPipelineStatusClick, 
  onDeleteClick, 
  pipelineStatus 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const navigate = useNavigate();

  const thumbnailUrl = useThumbnailUrl(video);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e) => {
    if (e) e.stopPropagation();
    setMenuAnchorEl(null);
  };

  const handleMenuAction = (action) => (e) => {
    e.stopPropagation();
    handleMenuClose();
    
    switch (action) {
      case 'pipeline':
        if (onProcessPipelineClick) onProcessPipelineClick(video);
        break;
      case 'history':
        navigate(`/pipelines?videoId=${video.id}`);
        break;
      case 'delete':
        if (onDeleteClick) onDeleteClick(video);
        break;
      default:
        break;
    }
  };

  const handlePipelineStatusClick = () => {
    if (onPipelineStatusClick) {
      onPipelineStatusClick(video);
    }
  };

  return (
    <Paper
      onClick={() => navigate(`/videos/${video.id}`)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: 1.5,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          position: 'relative',
          width: 80,
          height: 45,
          backgroundColor: 'grey.300',
          borderRadius: 1,
          overflow: 'hidden',
          flexShrink: 0,
          mr: 2,
        }}
      >
        {!imageLoaded && (
          <Skeleton
            variant="rectangular"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        )}
        {!imageError && thumbnailUrl && (
          <Box
            component="img"
            src={thumbnailUrl}
            alt={video.title}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
          />
        )}
        {(imageError || !thumbnailUrl) && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'grey.600',
              backgroundColor: 'grey.200',
            }}
          >
            <PlayCircleOutline sx={{ fontSize: 32, opacity: 0.5 }} />
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.5,
          }}
        >
          {video.title}
        </Typography>
        
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.5,
          }}
        >
          {video.filename} {video.duration && ` • ${formatDuration(video.duration)}`}
        </Typography>
        
        {/* Status badges */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <Chip
            label={video.has_audio ? 'Audio' : 'No Audio'}
            size="small"
            color={video.has_audio ? 'success' : 'default'}
            variant={video.has_audio ? 'filled' : 'outlined'}
            sx={{ height: 18, fontSize: '0.6rem' }}
          />
          <Chip
            label={video.has_transcript ? 'Transcript' : 'No Transcript'}
            size="small"
            color={video.has_transcript ? 'success' : 'default'}
            variant={video.has_transcript ? 'filled' : 'outlined'}
            sx={{ height: 18, fontSize: '0.6rem' }}
          />
          {video.moments && video.moments.length > 0 && (
            <Chip
              label={`${video.moments.length} moment${video.moments.length !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
        </Stack>
      </Box>

      {/* Pipeline status */}
      {pipelineStatus && (
        <Box sx={{ mr: 1 }}>
          <PipelineStatusBadge
            status={pipelineStatus.status}
            currentStage={pipelineStatus.current_stage}
            subStage={pipelineStatus.stages?.[pipelineStatus.current_stage]?.sub_stage}
            onClick={handlePipelineStatusClick}
          />
        </Box>
      )}

      {/* Three-dot menu */}
      <IconButton
        onClick={handleMenuOpen}
        size="small"
        aria-label="video actions"
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleMenuAction('pipeline')}>Run Pipeline</MenuItem>
        <MenuItem onClick={handleMenuAction('history')}>View Pipeline History</MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuAction('delete')} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
}

export default VideoListItem;
