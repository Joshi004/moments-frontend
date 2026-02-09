import React from 'react';
import { TextField, MenuItem } from '@mui/material';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'nameAsc', label: 'Name A-Z' },
  { value: 'nameDesc', label: 'Name Z-A' },
  { value: 'mostMoments', label: 'Most Moments' },
  { value: 'duration', label: 'Duration' },
];

/**
 * SortDropdown component for sorting videos
 * @param {string} sortOption - Current sort option
 * @param {function} onSortChange - Callback when sort option changes
 */
function SortDropdown({ sortOption, onSortChange }) {
  return (
    <TextField
      select
      size="small"
      value={sortOption}
      onChange={(e) => onSortChange(e.target.value)}
      sx={{ minWidth: 180 }}
      label="Sort by"
    >
      {SORT_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default SortDropdown;
