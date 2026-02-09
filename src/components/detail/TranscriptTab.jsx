import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search, Transcribe } from '@mui/icons-material';
import EmptyState from '../common/EmptyState';

const TranscriptTab = ({
  transcript,
  currentTime,
  onSeekTo,
  onGenerateTranscript,
  hasAudio = false,
  isProcessingTranscript = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Extract text from transcript (before any early returns to satisfy Rules of Hooks)
  const segments = useMemo(() => {
    return transcript?.segment_timestamps || [];
  }, [transcript]);
  
  const hasSegments = segments.length > 0;
  const fullText = transcript?.text || transcript?.full_text || '';

  // Find active segment (must be called before any early returns)
  const activeSegmentIndex = useMemo(() => {
    if (!hasSegments) return -1;
    return segments.findIndex(
      seg => currentTime >= seg.start && currentTime < seg.end
    );
  }, [segments, currentTime, hasSegments]);

  // Search functionality (must be called before any early returns)
  const { matchCount, highlightedSegments } = useMemo(() => {
    if (!searchTerm.trim()) {
      return { matchCount: 0, highlightedSegments: segments };
    }

    const searchLower = searchTerm.toLowerCase();
    let count = 0;
    
    const highlighted = segments.map(seg => {
      const text = seg.text || '';
      const textLower = text.toLowerCase();
      
      if (textLower.includes(searchLower)) {
        count++;
        return { ...seg, hasMatch: true };
      }
      return { ...seg, hasMatch: false };
    });
    
    return { matchCount: count, highlightedSegments: highlighted };
  }, [segments, searchTerm]);

  // Empty state when no transcript (after all hooks are called)
  if (!transcript) {
    return (
      <EmptyState
        icon={<Transcribe />}
        title="No transcript available"
        message={hasAudio 
          ? "Generate a transcript to enable AI-powered features and clickable captions."
          : "Extract audio from the video first to generate a transcript."}
        actionLabel={hasAudio ? (isProcessingTranscript ? "Generating..." : "Generate Transcript") : null}
        onAction={hasAudio ? onGenerateTranscript : null}
      />
    );
  }

  const highlightText = (text, search) => {
    if (!search) return text;
    
    const searchLower = search.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(searchLower);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <mark style={{ backgroundColor: '#FEF08A', padding: '0 2px' }}>
          {text.substring(index, index + search.length)}
        </mark>
        {highlightText(text.substring(index + search.length), search)}
      </>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Search bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search transcript..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        {searchTerm && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {matchCount} match{matchCount !== 1 ? 'es' : ''} found
          </Typography>
        )}
      </Box>

      {/* Transcript text */}
      {hasSegments ? (
        <Box
          sx={{
            maxHeight: '600px',
            overflowY: 'auto',
            p: 2,
            backgroundColor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'action.hover',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'action.disabled',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'action.disabledBackground',
              },
            },
          }}
        >
          {highlightedSegments.map((segment, index) => {
            const isActive = index === activeSegmentIndex;
            
            return (
              <Typography
                key={`segment-${index}`}
                component="span"
                onClick={() => onSeekTo(segment.start)}
                sx={{
                  display: 'inline',
                  cursor: 'pointer',
                  lineHeight: 1.8,
                  fontSize: '0.95rem',
                  padding: '2px 4px',
                  borderRadius: '2px',
                  backgroundColor: isActive ? 'primary.light' : segment.hasMatch ? 'rgba(254, 240, 138, 0.3)' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.main' : 'action.hover',
                  },
                }}
              >
                {searchTerm ? highlightText(segment.text, searchTerm) : segment.text}
                {' '}
              </Typography>
            );
          })}
        </Box>
      ) : fullText ? (
        <Box
          sx={{
            maxHeight: '600px',
            overflowY: 'auto',
            p: 2,
            backgroundColor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            sx={{
              lineHeight: 1.8,
              fontSize: '0.95rem',
              whiteSpace: 'pre-wrap',
            }}
          >
            {searchTerm ? highlightText(fullText, searchTerm) : fullText}
          </Typography>
        </Box>
      ) : (
        <Typography color="text.secondary">
          No transcript text available
        </Typography>
      )}
    </Box>
  );
};

export default TranscriptTab;
