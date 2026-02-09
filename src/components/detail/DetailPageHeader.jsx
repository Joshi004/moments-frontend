import React from 'react';
import { Box, IconButton, Typography, Stack, Skeleton } from '@mui/material';
import { ArrowBack, ChevronLeft, ChevronRight } from '@mui/icons-material';

const DetailPageHeader = ({
  videoTitle,
  onBack,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  loading = false,
}) => {
  return (
    <Box
      sx={{
        mb: 3,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        {/* Left: Back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
          <IconButton
            onClick={onBack}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
              },
            }}
            aria-label="Back to video library"
          >
            <ArrowBack />
          </IconButton>
          
          {/* Center: Video title */}
          {loading ? (
            <Skeleton variant="text" width={300} height={40} />
          ) : (
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
              }}
            >
              {videoTitle}
            </Typography>
          )}
        </Box>

        {/* Right: Previous/Next navigation */}
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          <IconButton
            onClick={onPrevious}
            disabled={!hasPrevious || loading}
            sx={{
              color: 'text.secondary',
              '&:hover:not(:disabled)': {
                color: 'primary.main',
              },
            }}
            aria-label="Previous video"
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={onNext}
            disabled={!hasNext || loading}
            sx={{
              color: 'text.secondary',
              '&:hover:not(:disabled)': {
                color: 'primary.main',
              },
            }}
            aria-label="Next video"
          >
            <ChevronRight />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default DetailPageHeader;
