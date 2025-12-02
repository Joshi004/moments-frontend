import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  useTheme,
  IconButton,
  Collapse,
  Chip,
  Tooltip,
} from '@mui/material';
import { PlayArrow, Add, AutoAwesome, Tune, ExpandMore, ExpandLess, ContentCut } from '@mui/icons-material';
import MomentConfigDisplay from './MomentConfigDisplay';

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

const ModelNameChip = ({ modelName, generationConfig }) => {
  // Use model from generation_config if available, fallback to model_name
  const modelFromConfig = generationConfig?.model;
  const displayModel = modelFromConfig || modelName || 'Unknown Model';
  
  // Get model display name and color
  const getModelDisplay = () => {
    const modelLower = displayModel.toLowerCase();
    if (modelLower === 'minimax') {
      return { name: 'MiniMax', color: 'primary' };
    } else if (modelLower === 'qwen') {
      return { name: 'Qwen3-VL', color: 'success' };
    } else if (modelLower === 'qwen3_omni') {
      return { name: 'Qwen3-Omini', color: 'success' };
    } else if (modelLower === 'qwen3_vl_fp8') {
      return { name: 'Qwen3-VL-FP8', color: 'warning' };
    }
    return { name: displayModel, color: 'default' };
  };

  const modelDisplay = getModelDisplay();
  const prompt = generationConfig?.user_prompt || generationConfig?.complete_prompt;
  const hasPrompt = prompt && prompt.trim().length > 0;
  
  const tooltipContent = hasPrompt ? (
    <Box
      sx={{
        maxWidth: '500px',
        maxHeight: '400px',
        overflow: 'auto',
        p: 1,
      }}
    >
      <Typography
        variant="caption"
        component="pre"
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          margin: 0,
        }}
      >
        {prompt}
      </Typography>
    </Box>
  ) : (
    <Typography variant="caption">Prompt not available</Typography>
  );

  return (
    <Tooltip
      title={tooltipContent}
      arrow
      placement="top"
      enterDelay={300}
      leaveDelay={100}
    >
      <Chip
        label={modelDisplay.name}
        size="small"
        color={modelDisplay.color}
        variant="outlined"
        sx={{
          fontSize: '0.7rem',
          height: '20px',
          cursor: hasPrompt ? 'help' : 'default',
          opacity: 0.8,
          '&:hover': {
            opacity: 1,
          },
        }}
      />
    </Tooltip>
  );
};

const MomentCard = ({ moment, isActive, onClick, onHover, onLeave, onRefineClick, refinedMoments = [], hasTranscript }) => {
  const theme = useTheme();
  const cardRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Auto-scroll active moment into view
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isActive]);

  const handleRefineClick = (e) => {
    e.stopPropagation();
    onRefineClick(moment);
  };

  const handleExpandClick = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <Box ref={cardRef} sx={{ mb: 1.5 }}>
      <Card
        onClick={() => onClick(moment.start_time)}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        sx={{
          cursor: 'pointer',
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
                
                <ModelNameChip modelName={moment.model_name} generationConfig={moment.generation_config} />
              </Box>
            </Box>
            
            {/* Actions */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {hasTranscript && !moment.is_refined && (
                <Tooltip title="Refine moment timestamps">
                  <IconButton
                    size="small"
                    onClick={handleRefineClick}
                    sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                  >
                    <Tune fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {refinedMoments.length > 0 && (
                <Tooltip title={expanded ? "Hide refined versions" : "Show refined versions"}>
                  <IconButton
                    size="small"
                    onClick={handleExpandClick}
                    sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                  >
                    {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                  </IconButton>
                </Tooltip>
              )}
              <PlayArrow sx={{ opacity: isActive ? 1 : 0.5 }} />
            </Box>
          </Box>
          
          {/* Configuration Display */}
          {moment.generation_config && (
            <Box sx={{ mt: 1 }}>
              <MomentConfigDisplay generationConfig={moment.generation_config} />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Refined Moments */}
      {refinedMoments.length > 0 && (
        <Collapse in={expanded}>
          <Box sx={{ pl: 4, pt: 1 }}>
            {refinedMoments.map((refined, index) => (
              <RefinedMomentCard
                key={refined.id || `${refined.start_time}-${refined.end_time}-${index}`}
                moment={refined}
                isActive={isActive}
                onClick={onClick}
                theme={theme}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

const RefinedMomentCard = ({ moment, isActive, onClick, theme }) => {
  return (
    <Card
      onClick={() => onClick(moment.start_time)}
      sx={{
        cursor: 'pointer',
        mb: 1,
        backgroundColor: isActive ? 'rgba(76, 175, 80, 0.08)' : 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: isActive ? '4px solid #4caf50' : '4px solid #4caf5080',
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: theme.shadows[1],
          backgroundColor: isActive 
            ? 'rgba(76, 175, 80, 0.12)' 
            : 'action.hover',
        },
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip 
            label="Refined" 
            size="small" 
            color="success" 
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: '20px' }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  opacity: 0.9,
                }}
              >
                {formatTime(moment.start_time)} - {formatTime(moment.end_time)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.7rem',
                  opacity: 0.7,
                }}
              >
                Duration: {formatDuration(moment.start_time, moment.end_time)}
              </Typography>
              <ModelNameChip modelName={moment.model_name} generationConfig={moment.generation_config} />
            </Box>
          </Box>
          <PlayArrow sx={{ fontSize: '1.2rem', opacity: 0.5 }} />
        </Box>
        
        {/* Configuration Display */}
        {moment.generation_config && (
          <Box sx={{ px: 0, pb: 0, pt: 1 }}>
            <MomentConfigDisplay generationConfig={moment.generation_config} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const MomentsList = ({ moments, currentTime, duration, onMomentClick, onAddMomentClick, onGenerateMomentsClick, hasTranscript, onRefineClick, onExtractClipsClick }) => {
  const theme = useTheme();
  
  // Group moments: separate original and refined
  const originalMoments = moments.filter(m => !m.is_refined);
  const refinedByParent = moments.filter(m => m.is_refined)
    .reduce((acc, m) => {
      const parentId = m.parent_id || 'unknown';
      acc[parentId] = acc[parentId] || [];
      acc[parentId].push(m);
      return acc;
    }, {});
  
  // Find active moment (check both original and refined moments)
  const activeMomentIndex = originalMoments.findIndex(
    moment => {
      // Check if current time is within this moment
      if (currentTime >= moment.start_time && currentTime <= moment.end_time) {
        return true;
      }
      // Also check refined versions
      const refinedVersions = refinedByParent[moment.id] || [];
      return refinedVersions.some(refined => 
        currentTime >= refined.start_time && currentTime <= refined.end_time
      );
    }
  );
  
  const activeMoment = activeMomentIndex >= 0 ? originalMoments[activeMomentIndex] : null;

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            color: 'text.primary',
          }}
        >
          Moments ({originalMoments.length})
        </Typography>
        
        {originalMoments.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ContentCut />}
            onClick={onExtractClipsClick}
            sx={{ ml: 2 }}
          >
            Extract Clips
          </Button>
        )}
      </Box>
      
      {originalMoments.map((moment, index) => {
        const refinedMoments = refinedByParent[moment.id] || [];
        // Check if any refined moment is active
        const isRefinedActive = refinedMoments.some(refined => 
          currentTime >= refined.start_time && currentTime <= refined.end_time
        );
        const isActive = index === activeMomentIndex || isRefinedActive;
        
        return (
          <MomentCard
            key={moment.id || `${moment.start_time}-${moment.end_time}-${index}`}
            moment={moment}
            isActive={isActive}
            onClick={onMomentClick}
            onHover={() => {}}
            onLeave={() => {}}
            onRefineClick={onRefineClick}
            refinedMoments={refinedMoments}
            hasTranscript={hasTranscript}
          />
        );
      })}
    </Box>
  );
};

export default MomentsList;

