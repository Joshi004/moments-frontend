import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
} from '@mui/material';
import { ContentCut } from '@mui/icons-material';
import ClipCard from './ClipCard';
import EmptyState from '../common/EmptyState';
import { getClipsForVideo } from '../../services/api';

const ClipsTab = ({
  moments = [],
  videoId,
}) => {
  const [clipAvailability, setClipAvailability] = useState({});
  const [loadingClips, setLoadingClips] = useState(true);

  // Get only coarse (non-refined) moments for clips
  const coarseMoments = useMemo(
    () => moments.filter(m => !m.is_refined),
    [moments]
  );

  // Fetch all clips for the video in a single bulk API call
  useEffect(() => {
    const fetchClips = async () => {
      if (!videoId || coarseMoments.length === 0) {
        setLoadingClips(false);
        return;
      }

      setLoadingClips(true);
      try {
        const clips = await getClipsForVideo(videoId);
        const clipMap = {};
        clips.forEach(clip => {
          if (clip.moment_identifier) {
            clipMap[clip.moment_identifier] = clip;
          }
        });
        setClipAvailability(clipMap);
      } catch (error) {
        console.error('Error fetching clips:', error);
        setClipAvailability({});
      } finally {
        setLoadingClips(false);
      }
    };

    fetchClips();
  }, [videoId, coarseMoments]);

  // Count available clips (each key in the map represents an available clip)
  const availableClipCount = Object.keys(clipAvailability).length;

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
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Extracted Clips
          {availableClipCount > 0 && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({availableClipCount} of {coarseMoments.length})
            </Typography>
          )}
        </Typography>
      </Box>

      {/* No clips available yet */}
      {availableClipCount === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <ContentCut sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {coarseMoments.length} moment{coarseMoments.length !== 1 ? 's' : ''} available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Run the pipeline to extract video clips for each moment
          </Typography>
        </Box>
      )}

      {/* Clips grid */}
      {availableClipCount > 0 && (
        <Grid container spacing={2}>
          {coarseMoments.map((moment) => {
            const clip = clipAvailability[moment.id] || null;

            return (
              <Grid item xs={12} sm={6} md={4} key={moment.id}>
                <ClipCard
                  moment={moment}
                  videoId={videoId}
                  clipAvailable={!!clip}
                  clipUrl={clip?.url || null}
                  clipMetadata={clip}
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
