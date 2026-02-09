import React, { useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import {
  History,
  CheckCircle,
  VideoLibrary,
  AutoAwesome,
  Transcribe,
  AudioFile,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RecentActivityFeed = ({ videos = [] }) => {
  const navigate = useNavigate();

  // Derive activity items from videos
  const activityItems = useMemo(() => {
    const items = [];

    videos.forEach(video => {
      // Calculate a "completeness score" to sort by most activity
      const score = 
        (video.moments?.length || 0) * 3 +
        (video.has_transcript ? 2 : 0) +
        (video.has_audio ? 1 : 0);

      // Generate activity description based on what's available
      let description = '';
      let icon = VideoLibrary;
      let iconColor = 'primary.main';

      if (video.moments && video.moments.length > 0) {
        description = `${video.moments.length} moment${video.moments.length !== 1 ? 's' : ''} generated`;
        icon = AutoAwesome;
        iconColor = 'secondary.main';
      } else if (video.has_transcript) {
        description = 'Transcript generated';
        icon = Transcribe;
        iconColor = 'info.main';
      } else if (video.has_audio) {
        description = 'Audio extracted';
        icon = AudioFile;
        iconColor = 'warning.main';
      } else {
        description = 'New video';
        icon = VideoLibrary;
        iconColor = 'primary.main';
      }

      items.push({
        videoId: video.id,
        filename: video.filename || video.id,
        description,
        icon,
        iconColor,
        score,
      });
    });

    // Sort by score (most activity first), then take top 10
    return items.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [videos]);

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <History />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Recent Videos
        </Typography>
      </Box>

      {activityItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <History sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No videos yet. Add videos to get started.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {activityItems.map((item, index) => {
            const Icon = item.icon;
            
            return (
              <Box
                key={`${item.videoId}-${index}`}
                onClick={() => navigate(`/videos/${item.videoId}`)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'action.selected',
                    color: item.iconColor,
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.filename}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
};

export default RecentActivityFeed;
