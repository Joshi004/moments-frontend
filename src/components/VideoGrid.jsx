import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import VideoCard from './VideoCard';

const VideoGrid = ({ videos, onVideoClick }) => {
  if (!videos || videos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No videos available
        </Typography>
      </Box>
    );
  }

  return (
    <Grid 
      container 
      spacing={{ xs: 2, sm: 2, md: 3 }} 
      sx={{ 
        py: { xs: 2, sm: 3 },
        px: { xs: 1, sm: 2 },
      }}
    >
      {videos.map((video) => (
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={4} 
          lg={3}
          key={video.id}
          sx={{
            display: 'flex',
          }}
        >
          <VideoCard video={video} onClick={() => onVideoClick(video)} />
        </Grid>
      ))}
    </Grid>
  );
};

export default VideoGrid;


