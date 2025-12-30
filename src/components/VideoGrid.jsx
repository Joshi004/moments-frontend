import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import VideoCard from './VideoCard';

const VideoGrid = ({ videos, onVideoClick, onAudioIconClick, onTranscriptIconClick, onProcessPipelineClick, onPipelineStatusClick, pipelineStatuses }) => {
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
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        py: { xs: 2, sm: 3 },
        px: { xs: 1, sm: 2 },
        justifyContent: 'flex-start',
      }}
    >
      {videos.map((video) => (
        <VideoCard 
          key={video.id}
          video={video} 
          onClick={() => onVideoClick(video)} 
          onAudioIconClick={onAudioIconClick}
          onTranscriptIconClick={onTranscriptIconClick}
          onProcessPipelineClick={onProcessPipelineClick}
          onPipelineStatusClick={onPipelineStatusClick}
          pipelineStatus={pipelineStatuses?.[video.id]}
        />
      ))}
    </Box>
  );
};

export default VideoGrid;


