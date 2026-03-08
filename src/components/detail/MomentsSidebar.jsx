import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Skeleton,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import MomentCard from './MomentCard';
import EmptyState from '../common/EmptyState';

const MomentsSidebar = ({
  moments = [],
  clipMap = {},
  currentTime,
  onMomentClick,
  onMomentPlayClick,
  onAddMomentClick,
  onDeleteMoment,
  onConfigClick,
  hasTranscript,
  loading = false,
}) => {
  const [selectedTab, setSelectedTab] = useState(0); // 0 = Coarse, 1 = Refined

  // Filter moments by type
  const coarseMoments = useMemo(
    () => moments.filter(m => !m.is_refined),
    [moments]
  );
  
  const refinedMoments = useMemo(
    () => moments.filter(m => m.is_refined),
    [moments]
  );

  const displayedMoments = selectedTab === 0 ? coarseMoments : refinedMoments;

  // Find active moment
  const activeMoment = useMemo(() => {
    return displayedMoments.find(
      moment => currentTime >= moment.start_time && currentTime <= moment.end_time
    );
  }, [displayedMoments, currentTime]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  if (loading) {
    return (
      <Paper
        elevation={2}
        sx={{
          height: '99%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={300} />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        height: '99%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header with action buttons */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 2,
          }}
        >
          Moments ({moments.length})
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={onAddMomentClick}
          size="small"
          fullWidth
          sx={{ fontSize: '0.75rem' }}
        >
          Add Moment
        </Button>
      </Box>

      {/* Tabs for Coarse/Refined */}
      {moments.length > 0 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: '0.875rem',
                textTransform: 'none',
                fontWeight: 500,
              },
            }}
          >
            <Tab label={`Coarse (${coarseMoments.length})`} />
            <Tab label={`Refined (${refinedMoments.length})`} />
          </Tabs>
        </Box>
      )}

      {/* Moments list */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
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
        {displayedMoments.length === 0 ? (
          <EmptyState
            icon={<Add />}
            title="No moments"
            message={hasTranscript 
              ? "Run the pipeline to generate AI-powered moments, or add moments manually."
              : "Generate a transcript first via the pipeline to enable AI-powered moments."}
          />
        ) : (
          displayedMoments.map((moment) => {
            const isActive = activeMoment?.id === moment.id;
            // Refined moments share their parent coarse moment's clip
            const clipKey = moment.is_refined ? moment.parent_id : moment.id;
            const hasClip = !!clipMap[clipKey];

            return (
              <MomentCard
                key={moment.id || `${moment.start_time}-${moment.end_time}`}
                moment={moment}
                isActive={isActive}
                hasClip={hasClip}
                onClick={onMomentClick}
                onPlayClick={onMomentPlayClick}
                onDeleteClick={onDeleteMoment}
                onConfigClick={onConfigClick}
              />
            );
          })
        )}
      </Box>

    </Paper>
  );
};

export default MomentsSidebar;
