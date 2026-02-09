import React from 'react';
import { Box, Stack, Paper, useTheme, useMediaQuery } from '@mui/material';
import SearchBar from './SearchBar';
import FilterChips from './FilterChips';
import SortDropdown from './SortDropdown';
import ViewToggle from './ViewToggle';

/**
 * LibraryToolbar component - composes search, filter, sort, and view toggle
 * @param {string} searchTerm - Current search term
 * @param {function} onSearchChange - Callback when search changes
 * @param {string[]} activeFilters - Array of active filter IDs
 * @param {function} onFilterChange - Callback when filters change
 * @param {string} sortOption - Current sort option
 * @param {function} onSortChange - Callback when sort changes
 * @param {string} viewMode - Current view mode
 * @param {function} onViewModeChange - Callback when view mode changes
 */
function LibraryToolbar({
  searchTerm,
  onSearchChange,
  activeFilters,
  onFilterChange,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}>
      <Stack spacing={2}>
        {/* Row 1: Search, Sort, View Toggle */}
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={2}
          alignItems={isMobile ? 'stretch' : 'center'}
        >
          <SearchBar value={searchTerm} onChange={onSearchChange} />
          <SortDropdown sortOption={sortOption} onSortChange={onSortChange} />
          <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
        </Stack>

        {/* Row 2: Filter Chips */}
        <FilterChips activeFilters={activeFilters} onFilterChange={onFilterChange} />
      </Stack>
    </Paper>
  );
}

export default LibraryToolbar;
