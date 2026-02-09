import React from 'react';
import { Box, Chip, Stack } from '@mui/material';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PipelineStatusFilter = ({ activeFilter = 'all', onFilterChange }) => {
  const handleFilterClick = (filterValue) => {
    if (onFilterChange) {
      onFilterChange(filterValue);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {FILTER_OPTIONS.map((option) => {
          const isActive = activeFilter === option.value;
          return (
            <Chip
              key={option.value}
              label={option.label}
              color={isActive ? 'primary' : 'default'}
              variant={isActive ? 'filled' : 'outlined'}
              onClick={() => handleFilterClick(option.value)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
};

export default PipelineStatusFilter;
