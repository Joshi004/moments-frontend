import React from 'react';
import { Card, CardContent, Box, Skeleton, Stack } from '@mui/material';

const SkeletonCard = () => {
  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Thumbnail skeleton */}
      <Skeleton
        variant="rectangular"
        sx={{
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio
        }}
      />
      
      {/* Content skeleton */}
      <CardContent sx={{ p: 1.5, '&:last-child': { paddingBottom: 1.5 } }}>
        {/* Title skeleton - 2 lines */}
        <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />
        
        {/* Chips skeleton */}
        <Stack direction="row" spacing={0.5} sx={{ mb: 0.5 }}>
          <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={70} height={20} sx={{ borderRadius: 1 }} />
        </Stack>
        
        {/* Filename skeleton */}
        <Skeleton variant="text" width="85%" height={16} />
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;
