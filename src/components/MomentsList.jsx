import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  useTheme,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import { PlayArrow, Add, AutoAwesome, Tune, Info, ContentCut } from '@mui/icons-material';
import MomentConfigDrawer from './MomentConfigDrawer';

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

const getModelName = (moment) => {
  // Try to get model from generation_config first
  const model = moment.generation_config?.model || moment.model_name;
  if (!model) return null;
  
  const modelLower = model.toLowerCase();
  if (modelLower === 'minimax') return 'MiniMax';
  if (modelLower === 'qwen') return 'Qwen3-VL';
  if (modelLower === 'qwen3_omni') return 'Qwen3-Omini';
  if (modelLower === 'qwen3_vl_fp8') return 'Qwen3-VL-FP8';
  return model;
};

const MomentCard = ({ 
  moment, 
  isActive, 
  onClick, 
  onRefineClick, 
  refinedMoments = [], 
  hasTranscript,
  onConfigClick 
}) => {
  const theme = useTheme();
  const cardRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState(0); // 0 = Coarse, 1+ = Refined versions

  useEffect(() => {
    // Auto-scroll active moment into view
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isActive]);

  // Reset to coarse tab when moment changes
  useEffect(() => {
    setSelectedTab(0);
  }, [moment.id]);

  const hasRefinedVersion = refinedMoments.length > 0;
  
  // Build tabs array dynamically
  const tabs = [
    { label: 'Coarse', moment: moment },
    ...refinedMoments.map((refined, idx) => ({
      label: refinedMoments.length === 1 ? 'Refined' : `Refined ${idx + 1}`,
      moment: refined
    }))
  ];
  
  const displayMoment = tabs[selectedTab]?.moment || moment;

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleCardClick = () => {
    onClick(displayMoment.start_time);
  };

  const handleRefineClick = (e) => {
    e.stopPropagation();
    onRefineClick(moment);
  };

  const handleConfigClick = (e) => {
    e.stopPropagation();
    onConfigClick(displayMoment.generation_config, displayMoment.title || moment.title);
  };

  return (
    <Box ref={cardRef} sx={{ mb: 1.5 }}>
      <Card
        onClick={handleCardClick}
        sx={{
          cursor: 'pointer',
          backgroundColor: isActive ? 'rgba(255, 0, 0, 0.08)' : 'background.paper',
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'divider',
          borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : '1px solid',
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
          {/* Header Row */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: isActive ? 600 : 500,
                fontSize: '1rem',
                lineHeight: 1.3,
                flex: 1,
                minWidth: 0,
                pr: 2,
              }}
            >
              {moment.title}
            </Typography>
            
            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {displayMoment.generation_config && (
                <Tooltip title="View configuration">
                  <IconButton
                    size="small"
                    onClick={handleConfigClick}
                    sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                  >
                    <Info fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <PlayArrow sx={{ opacity: isActive ? 1 : 0.5, ml: 0.5 }} />
            </Box>
          </Box>

          {/* Tabs for Coarse/Refined - Show all versions */}
          {tabs.length > 1 && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1.5 }}>
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                onClick={(e) => e.stopPropagation()}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 36,
                  '& .MuiTab-root': {
                    minHeight: 36,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    minWidth: 70,
                    py: 0.5,
                  },
                }}
              >
                {tabs.map((tab, idx) => (
                  <Tab key={idx} label={tab.label} />
                ))}
              </Tabs>
            </Box>
          )}

          {/* Timestamp and Duration */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                opacity: isActive ? 0.9 : 0.7,
                fontSize: '0.875rem',
              }}
            >
              {formatTime(displayMoment.start_time)} - {formatTime(displayMoment.end_time)}
            </Typography>
            
            <Typography
              variant="body2"
              sx={{
                opacity: isActive ? 0.8 : 0.6,
                fontSize: '0.75rem',
              }}
            >
              Duration: {formatDuration(displayMoment.start_time, displayMoment.end_time)}
            </Typography>
          </Box>

          {/* Model Chip */}
          {getModelName(displayMoment) && (
            <Box sx={{ mt: 1 }}>
              <Chip
                label={getModelName(displayMoment)}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  height: '20px',
                  opacity: 0.8,
                }}
              />
            </Box>
          )}

          {/* Refine button - Always show if has transcript and not a refined moment itself */}
          {hasTranscript && !moment.is_refined && (
            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Tune />}
                onClick={handleRefineClick}
                sx={{ fontSize: '0.75rem' }}
              >
                Refine Timestamps
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

const MomentsList = ({ 
  moments, 
  currentTime, 
  duration, 
  onMomentClick, 
  onAddMomentClick, 
  onGenerateMomentsClick, 
  hasTranscript, 
  onRefineClick, 
  onExtractClipsClick 
}) => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedMomentTitle, setSelectedMomentTitle] = useState('');
  
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

  const handleConfigClick = (config, title) => {
    setSelectedConfig(config);
    setSelectedMomentTitle(title);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    // Don't clear config immediately to avoid flicker during close animation
    setTimeout(() => {
      setSelectedConfig(null);
      setSelectedMomentTitle('');
    }, 200);
  };

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
    <>
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
              onRefineClick={onRefineClick}
              refinedMoments={refinedMoments}
              hasTranscript={hasTranscript}
              onConfigClick={handleConfigClick}
            />
          );
        })}
      </Box>

      <MomentConfigDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        config={selectedConfig}
        momentTitle={selectedMomentTitle}
      />
    </>
  );
};

export default MomentsList;
