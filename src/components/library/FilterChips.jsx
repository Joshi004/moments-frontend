import React from 'react';
import { Stack, Chip } from '@mui/material';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'hasAudio', label: 'Has Audio' },
  { id: 'hasTranscript', label: 'Has Transcript' },
  { id: 'hasMoments', label: 'Has Moments' },
];

/**
 * FilterChips component for filtering videos by processing status
 * @param {string[]} activeFilters - Array of active filter IDs
 * @param {function} onFilterChange - Callback when filters change
 */
function FilterChips({ activeFilters, onFilterChange }) {
  const handleChipClick = (filterId) => {
    if (filterId === 'all') {
      // Clicking "All" deselects everything else
      onFilterChange(['all']);
    } else {
      // Clicking a specific filter
      const isCurrentlyActive = activeFilters.includes(filterId);
      
      if (isCurrentlyActive) {
        // Remove this filter
        const newFilters = activeFilters.filter((f) => f !== filterId);
        // If no filters left, activate "All"
        onFilterChange(newFilters.length === 0 ? ['all'] : newFilters);
      } else {
        // Add this filter and remove "All"
        const newFilters = activeFilters.filter((f) => f !== 'all').concat(filterId);
        onFilterChange(newFilters);
      }
    }
  };

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilters.includes(option.id);
        return (
          <Chip
            key={option.id}
            label={option.label}
            onClick={() => handleChipClick(option.id)}
            variant={isActive ? 'filled' : 'outlined'}
            color={isActive ? 'primary' : 'default'}
            size="small"
          />
        );
      })}
    </Stack>
  );
}

export default FilterChips;
