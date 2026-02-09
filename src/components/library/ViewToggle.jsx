import React from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { GridView as GridViewIcon, ViewList as ViewListIcon } from '@mui/icons-material';

/**
 * ViewToggle component for switching between grid and list view
 * @param {string} viewMode - Current view mode ('grid' or 'list')
 * @param {function} onViewModeChange - Callback when view mode changes
 */
function ViewToggle({ viewMode, onViewModeChange }) {
  const handleChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      localStorage.setItem('videoLibraryViewMode', newViewMode);
      onViewModeChange(newViewMode);
    }
  };

  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={handleChange}
      size="small"
      aria-label="view mode"
    >
      <ToggleButton value="grid" aria-label="grid view">
        <GridViewIcon />
      </ToggleButton>
      <ToggleButton value="list" aria-label="list view">
        <ViewListIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export default ViewToggle;
