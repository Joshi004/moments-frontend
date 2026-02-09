import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

/**
 * SearchBar component for filtering videos
 * @param {string} value - Current search term
 * @param {function} onChange - Callback when search term changes
 */
function SearchBar({ value, onChange }) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <TextField
      size="small"
      placeholder="Search videos..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
              edge="end"
              aria-label="clear search"
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{ flexGrow: 1, minWidth: 200 }}
    />
  );
}

export default SearchBar;
