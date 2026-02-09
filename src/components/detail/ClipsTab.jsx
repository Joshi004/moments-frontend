import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material';
import { ContentCut } from '@mui/icons-material';
import ClipCard from './ClipCard';
import EmptyState from '../common/EmptyState';
import { checkVideoAvailability } from '../../services/api';

const ClipsTab = ({
  moments = [],
  videoId,
  onExtractClips,
  isExtractingClips = false,
}) => {
  const [clipAvailability, setClipAvailability] = useState({});
  const [loadingClips, setLoadingClips] = useState(true);

  // Get only coarse (non-refined) moments for clips
  const coarseMoments = useMemo(
    () => moments.filter(m => !m.is_refined),
    [moments]
  );

  // Check clip availability for each moment on mount
  useEffect(() => {
    const checkClips = async () => {
      if (!videoId || coarseMoments.length === 0) {
        setLoadingClips(false);
        return;
      }

      setLoadingClips(true);
      
      const availabilityChecks = coarseMoments.map(moment =>
        checkVideoAvailability(videoId, moment.id)
          .then(response => ({
            momentId: moment.id,
            available: response.available || false,
            clip_path: response.clip_path || null,
          }))
          .catch(() => ({
            momentId: moment.id,
            available: false,
            clip_path: null,
          }))
      );

      const results = await Promise.allSettled(availabilityChecks);
      
      const availabilityMap = {};
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          const { momentId, available, clip_path } = result.value;
          availabilityMap[momentId] = { available, clip_path };
        }
      });

      setClipAvailability(availabilityMap);
      setLoadingClips(false);
    };

    checkClips();
  }, [videoId, coarseMoments]);

  // Count available clips
  const availableClipCount = Object.values(clipAvailability).filter(c => c.available).length;

  // Empty state when no moments
  if (moments.length === 0) {
    return (
      <EmptyState
        icon={<ContentCut />}
        title="No clips extracted yet"
        message="Generate moments first, then extract clips to create downloadable video segments."
      />
    );
  }

  // Loading state
  if (loadingClips) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Extract button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Extracted Clips
          {availableClipCount > 0 && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({availableClipCount} of {coarseMoments.length})
            </Typography>
          )}
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<ContentCut />}
          onClick={onExtractClips}
          disabled={coarseMoments.length === 0 || isExtractingClips}
          size="small"
        >
          {isExtractingClips ? 'Extracting...' : 'Extract All Clips'}
        </Button>
      </Box>

      {/* No clips available yet */}
      {availableClipCount === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <ContentCut sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {coarseMoments.length} moment{coarseMoments.length !== 1 ? 's' : ''} available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click "Extract All Clips" to generate video clips for each moment
          </Typography>
        </Box>
      )}

      {/* Clips grid */}
      {availableClipCount > 0 && (
        <Grid container spacing={2}>
          {coarseMoments.map((moment) => {
            const clipData = clipAvailability[moment.id];
            const available = clipData?.available || false;
            const clipPath = clipData?.clip_path || null;

            return (
              <Grid item xs={12} sm={6} md={4} key={moment.id}>
                <ClipCard
                  moment={moment}
                  videoId={videoId}
                  clipAvailable={available}
                  clipPath={clipPath}
                />
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default ClipsTab;
