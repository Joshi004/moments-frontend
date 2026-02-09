import React from 'react';
import { Stack, Box } from '@mui/material';
import { VideoLibrary as VideoLibraryIcon } from '@mui/icons-material';
import VideoCard from './VideoCard';
import VideoListItem from './library/VideoListItem';
import EmptyState from './common/EmptyState';

const VideoGrid = ({ 
  videos, 
  viewMode = 'grid',
  onVideoClick, 
  onAudioIconClick, 
  onTranscriptIconClick, 
  onProcessPipelineClick, 
  onPipelineStatusClick, 
  onDeleteClick, 
  pipelineStatuses 
}) => {
  if (!videos || videos.length === 0) {
    return (
      <EmptyState
        icon={<VideoLibraryIcon />}
        title="No videos found"
        message="Try adjusting your search or filters"
      />
    );
  }

  // List view mode
  if (viewMode === 'list') {
    return (
      <Stack spacing={1}>
        {videos.map((video) => (
          <VideoListItem
            key={video.id}
            video={video} 
            onClick={() => onVideoClick(video)} 
            onAudioIconClick={onAudioIconClick}
            onTranscriptIconClick={onTranscriptIconClick}
            onProcessPipelineClick={onProcessPipelineClick}
            onPipelineStatusClick={onPipelineStatusClick}
            onDeleteClick={onDeleteClick}
            pipelineStatus={pipelineStatuses?.[video.id]}
          />
        ))}
      </Stack>
    );
  }

  // Grid view mode (default)
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
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
          onDeleteClick={onDeleteClick}
          pipelineStatus={pipelineStatuses?.[video.id]}
        />
      ))}
    </Box>
  );
};

export default VideoGrid;


