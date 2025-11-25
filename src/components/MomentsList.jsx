import React, { useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  useTheme,
} from '@mui/material';
import { PlayArrow, Add, AutoAwesome } from '@mui/icons-material';

const formatTime = (seconds) => {
  if (isNaN(seconds)) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDuration = (startTime, endTime) => {
  const duration = endTime - startTime;
  const mins = Math.floor(duration / 60);
  const secs = Math.floor(duration % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const MomentCard = ({ moment, isActive, onClick, onHover, onLeave }) => {
  const theme = useTheme();
  const cardRef = useRef(null);

  useEffect(() => {
    // Auto-scroll active moment into view
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isActive]);

  return (
    <Card
      ref={cardRef}
      onClick={() => onClick(moment.start_time)}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      sx={{
        cursor: 'pointer',
        mb: 1.5,
        backgroundColor: isActive ? 'rgba(255, 0, 0, 0.08)' : 'background.paper',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : 'none',
        boxShadow: isActive ? '0 2px 8px rgba(255, 0, 0, 0.15)' : 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: isActive 
            ? '0 2px 12px rgba(255, 0, 0, 0.2)' 
            : theme.shadows[2],
          backgroundColor: isActive 
            ? 'rgba(255, 0, 0, 0.12)' 
            : 'action.hover',
        },
      }}
      elevation={isActive ? 2 : 1}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Visual Indicator */}
          <Box
            sx={{
              width: 4,
              minWidth: 4,
              height: '100%',
              backgroundColor: theme.palette.primary.main,
              borderRadius: 1,
              opacity: isActive ? 0.6 : 0.4,
            }}
          />
          
          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: isActive ? 600 : 500,
                mb: 1,
                fontSize: '1rem',
                lineHeight: 1.3,
              }}
            >
              {moment.title}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  opacity: isActive ? 0.9 : 0.7,
                  fontSize: '0.875rem',
                }}
              >
                {formatTime(moment.start_time)} - {formatTime(moment.end_time)}
              </Typography>
              
              <Typography
                variant="body2"
                sx={{
                  opacity: isActive ? 0.8 : 0.6,
                  fontSize: '0.75rem',
                }}
              >
                Duration: {formatDuration(moment.start_time, moment.end_time)}
              </Typography>
            </Box>
          </Box>
          
          {/* Play Icon */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              opacity: isActive ? 1 : 0.5,
            }}
          >
            <PlayArrow />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const MomentsList = ({ moments, currentTime, duration, onMomentClick, onAddMomentClick, onGenerateMomentsClick, hasTranscript }) => {
  const theme = useTheme();
  
  // Find active moment
  const activeMomentIndex = moments.findIndex(
    moment => currentTime >= moment.start_time && currentTime <= moment.end_time
  );
  
  const activeMoment = activeMomentIndex >= 0 ? moments[activeMomentIndex] : null;

  // Empty state
  if (moments.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No moments yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create moments to easily navigate through your video
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {hasTranscript && (
            <Button
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={onGenerateMomentsClick}
            >
              Generate Moments
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={onAddMomentClick}
          >
            Add Moment
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: 'background.paper',
        maxHeight: '400px',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'action.hover',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'action.disabled',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'action.disabledBackground',
          },
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 500,
          color: 'text.primary',
        }}
      >
        Moments ({moments.length})
      </Typography>
      
      {moments.map((moment, index) => (
        <MomentCard
          key={`${moment.start_time}-${moment.end_time}-${index}`}
          moment={moment}
          isActive={index === activeMomentIndex}
          onClick={onMomentClick}
          onHover={() => {}}
          onLeave={() => {}}
        />
      ))}
    </Box>
  );
};

export default MomentsList;

