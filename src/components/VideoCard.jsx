import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Skeleton, IconButton, Menu, MenuItem, Divider, Chip, Stack } from '@mui/material';
import { PlayCircleOutline, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getThumbnailUrl, getBackendBaseUrl } from '../services/api';
import PipelineStatusBadge from './PipelineStatusBadge';
import { formatDuration } from '../utils/formatters';

const VideoCard = ({ 
  video, 
  onClick, 
  onProcessPipelineClick, 
  onPipelineStatusClick, 
  onDeleteClick, 
  pipelineStatus,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const navigate = useNavigate();
  
  const thumbnailUrl = video.thumbnail_url 
    ? `${getBackendBaseUrl()}${video.thumbnail_url}`
    : getThumbnailUrl(video.id);

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
    // Note: stopPropagation is already handled by PipelineStatusBadge
    if (onPipelineStatusClick) {
      onPipelineStatusClick(video);
    }
  };

  const handleCardClick = () => {
    navigate(`/videos/${video.id}`);
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        border: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.12)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          '& .play-overlay': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            '& .MuiSvgIcon-root': {
              opacity: 0.9,
            },
          },
        },
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: 'auto',
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: 'background.paper',
      }}
      onClick={handleCardClick}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio
          backgroundColor: 'grey.300',
          overflow: 'hidden',
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
            onLoad={handleImageLoad}
            onError={handleImageError}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: imageLoaded ? 'block' : 'none',
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
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'grey.600',
              backgroundColor: 'grey.200',
            }}
          >
            <PlayCircleOutline sx={{ fontSize: 64, opacity: 0.5 }} />
          </Box>
        )}
        {/* Play button overlay on hover */}
        <Box
          className="play-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            transition: 'background-color 0.2s ease-in-out',
          }}
        >
          <PlayCircleOutline
            sx={{
              fontSize: 64,
              color: 'white',
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
            }}
          />
        </Box>
        {/* Duration badge */}
        {video.duration && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 500,
              zIndex: 10,
            }}
          >
            {formatDuration(video.duration)}
          </Box>
        )}
        {/* Three-dot menu button */}
        <IconButton
          onClick={handleMenuOpen}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            padding: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
            zIndex: 10,
          }}
          size="small"
          aria-label="video actions"
        >
          <MoreVertIcon sx={{ fontSize: 20 }} />
        </IconButton>
        {/* Pipeline Status Badge */}
        {pipelineStatus && (
          <PipelineStatusBadge
            status={pipelineStatus.status}
            currentStage={pipelineStatus.current_stage}
            onClick={handlePipelineStatusClick}
          />
        )}
      </Box>
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: 1.5,
          minHeight: 0,
          '&:last-child': {
            paddingBottom: 1.5,
          },
        }}
      >
        <Typography
          variant="subtitle1"
          component="h3"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
            mb: 0.5,
            color: 'text.primary',
          }}
        >
          {video.title}
        </Typography>
        
        {/* Status badges */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
          {/* Audio status */}
          <Chip
            label={video.has_audio ? 'Audio' : 'No Audio'}
            size="small"
            color={video.has_audio ? 'success' : 'default'}
            variant={video.has_audio ? 'filled' : 'outlined'}
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
          
          {/* Transcript status */}
          <Chip
            label={video.has_transcript ? 'Transcript' : 'No Transcript'}
            size="small"
            color={video.has_transcript ? 'success' : 'default'}
            variant={video.has_transcript ? 'filled' : 'outlined'}
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
          
          {/* Moments count */}
          {video.moments && video.moments.length > 0 && (
            <Chip
              label={`${video.moments.length} moment${video.moments.length !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          )}
        </Stack>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '0.75rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mt: 'auto',
          }}
        >
          {video.filename}
        </Typography>
      </CardContent>
      
      {/* Three-dot menu */}
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
    </Card>
  );
};

export default VideoCard;

