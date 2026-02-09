import React, { useState, useEffect, useRef } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

const PipelineSearchBar = ({ value, onChange, onSearch, placeholder = 'Search by video ID or filename...' }) => {
  const [localValue, setLocalValue] = useState(value || '');
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (onChange) {
      onChange(newValue);
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced timer (300ms)
    debounceTimerRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(newValue);
      }
    }, 300);
  };

  const handleClear = () => {
    setLocalValue('');
    if (onChange) {
      onChange('');
    }
    if (onSearch) {
      onSearch('');
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <TextField
      fullWidth
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
        endAdornment: localValue && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear} edge="end">
              <Clear />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default PipelineSearchBar;
