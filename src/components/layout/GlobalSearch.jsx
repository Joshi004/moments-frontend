import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  InputAdornment,
  CircularProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Search, VideoLibrary } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getVideos } from '../../services/api';
import useDebounce from '../../hooks/useDebounce';

const GlobalSearch = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const inputRef = useRef(null);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  
  const debouncedInput = useDebounce(inputValue, 300);

  // Load videos on mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const data = await getVideos();
        setVideos(data);
      } catch (error) {
        console.error('Failed to load videos for search:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();

    // Optionally refetch on window focus
    const handleFocus = () => {
      fetchVideos();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Global keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter videos based on search
  const filteredVideos = useMemo(() => {
    if (!debouncedInput.trim()) {
      return videos.slice(0, 10); // Show first 10 when empty
    }

    const query = debouncedInput.toLowerCase();
    return videos.filter(video => 
      (video.id && video.id.toLowerCase().includes(query)) ||
      (video.filename && video.filename.toLowerCase().includes(query)) ||
      (video.title && video.title.toLowerCase().includes(query))
    );
  }, [videos, debouncedInput]);

  const handleSelect = (event, value) => {
    if (value) {
      navigate(`/videos/${value.id}`);
      setSearchValue('');
      setInputValue('');
      // Blur input
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={filteredVideos}
      value={searchValue}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={handleSelect}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        return option.filename || option.title || option.id;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          placeholder={isMobile ? "Search..." : "Search videos..."}
          size="small"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.02)',
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <ListItem {...props} key={option.id}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <VideoLibrary />
          </ListItemIcon>
          <ListItemText
            primary={option.filename || option.title}
            secondary={option.id !== option.filename ? option.id : null}
            primaryTypographyProps={{
              noWrap: true,
              sx: { fontSize: '0.875rem' },
            }}
            secondaryTypographyProps={{
              noWrap: true,
              sx: { fontSize: '0.75rem' },
            }}
          />
        </ListItem>
      )}
      noOptionsText={
        loading ? 'Loading videos...' : 
        inputValue ? 'No videos found' : 'Start typing to search...'
      }
      PaperComponent={({ children, ...other }) => (
        <Paper {...other} elevation={8}>
          {children}
        </Paper>
      )}
      sx={{
        width: isMobile ? '100%' : 400,
        maxWidth: '100%',
      }}
    />
  );
};

export default GlobalSearch;
