import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
} from '@mui/material';
import { Timeline, VideoLibrary } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PipelineSearchBar from './PipelineSearchBar';
import PipelineStatusFilter from './PipelineStatusFilter';
import PipelineHistoryRow from './PipelineHistoryRow';

const ITEMS_PER_PAGE = 20;

const PipelineHistoryTable = ({ historyData = [], videos = [], loading = false }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('started_desc'); // started_desc, started_asc, duration_desc, duration_asc
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Create a map of video IDs to filenames for quick lookup
  const videoMap = useMemo(() => {
    const map = new Map();
    videos.forEach((video) => {
      map.set(video.id, video.filename || video.id);
    });
    return map;
  }, [videos]);

  // Filter and sort history data
  const filteredAndSortedData = useMemo(() => {
    let result = [...historyData];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const videoFilename = videoMap.get(item.video_id) || item.video_id;
        return (
          item.video_id.toLowerCase().includes(query) ||
          videoFilename.toLowerCase().includes(query)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((item) => item.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'started_desc':
          return new Date(b.started_at) - new Date(a.started_at);
        case 'started_asc':
          return new Date(a.started_at) - new Date(b.started_at);
        case 'duration_desc':
          return (b.total_duration_seconds || 0) - (a.total_duration_seconds || 0);
        case 'duration_asc':
          return (a.total_duration_seconds || 0) - (b.total_duration_seconds || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [historyData, searchQuery, statusFilter, sortBy, videoMap]);

  const visibleData = filteredAndSortedData.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedData.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setVisibleCount(ITEMS_PER_PAGE); // Reset pagination when searching
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setVisibleCount(ITEMS_PER_PAGE); // Reset pagination when filtering
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  // Loading state
  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Pipeline History
        </Typography>
        <Stack spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      </Paper>
    );
  }

  // Empty state
  if (historyData.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Pipeline History
        </Typography>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Timeline sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No pipeline history found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Pipeline runs will appear here once you start processing videos
          </Typography>
          <Button
            variant="outlined"
            startIcon={<VideoLibrary />}
            onClick={() => navigate('/videos')}
          >
            Go to Videos
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Pipeline History
      </Typography>

      {/* Search and Filter Controls */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          {/* Search Bar */}
          <Box sx={{ flex: 1 }}>
            <PipelineSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearchChange}
            />
          </Box>

          {/* Status Filter */}
          <Box>
            <PipelineStatusFilter activeFilter={statusFilter} onFilterChange={handleFilterChange} />
          </Box>

          {/* Sort Dropdown */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Sort by</InputLabel>
            <Select value={sortBy} onChange={handleSortChange} label="Sort by">
              <MenuItem value="started_desc">Newest First</MenuItem>
              <MenuItem value="started_asc">Oldest First</MenuItem>
              <MenuItem value="duration_desc">Longest Duration</MenuItem>
              <MenuItem value="duration_asc">Shortest Duration</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Results count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {visibleData.length} of {filteredAndSortedData.length} result(s)
      </Typography>

      {/* History List */}
      {filteredAndSortedData.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No results match your search criteria
          </Typography>
        </Box>
      ) : (
        <Box>
          {visibleData.map((item, index) => (
            <PipelineHistoryRow
              key={`${item.video_id}-${item.started_at}-${index}`}
              run={item}
              videoFilename={videoMap.get(item.video_id)}
              defaultExpanded={false}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button variant="outlined" onClick={handleLoadMore}>
                Load More ({filteredAndSortedData.length - visibleCount} remaining)
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default PipelineHistoryTable;
