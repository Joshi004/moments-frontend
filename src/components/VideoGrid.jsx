import React from 'react';
import { Stack, Box } from '@mui/material';
import { 
  VideoLibrary as VideoLibraryIcon,
  SearchOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import VideoCard from './VideoCard';
import VideoListItem from './library/VideoListItem';
import EmptyState from './common/EmptyState';

const VideoGrid = ({ 
  videos, 
  viewMode = 'grid',
  onProcessPipelineClick, 
  onPipelineStatusClick, 
  onDeleteClick, 
  pipelineStatuses,
  hasActiveFilters = false,
  onClearFilters,
  allVideosCount = 0,
}) => {
  const navigate = useNavigate();

  if (!videos || videos.length === 0) {
    // No videos at all vs no search results
    if (allVideosCount === 0 && !hasActiveFilters) {
      return (
        <EmptyState
          icon={<VideoLibraryIcon />}
          title="No videos yet"
          message="Get started by generating moments from a video URL or adding videos to your library."
          actionLabel="Generate from URL"
          onAction={() => navigate('/generate')}
        />
      );
    } else {
      return (
        <EmptyState
          icon={<SearchOff />}
          title="No results found"
          message="No videos match your current search or filter criteria. Try adjusting your filters."
          actionLabel={hasActiveFilters ? "Clear filters" : undefined}
          onAction={hasActiveFilters ? onClearFilters : undefined}
        />
      );
    }
  }

  // List view mode
  if (viewMode === 'list') {
    return (
      <Stack spacing={1}>
        {videos.map((video) => (
          <VideoListItem
            key={video.id}
            video={video}
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
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2,
      }}
    >
      {videos.map((video) => (
        <VideoCard 
          key={video.id}
          video={video}
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


