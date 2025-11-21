import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';
import { PlayCircleOutline } from '@mui/icons-material';

const VideoCard = ({ video, onClick }) => {
  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={onClick}
    >
      <CardMedia
        sx={{
          height: 200,
          backgroundColor: 'grey.300',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'grey.600',
          }}
        >
          <PlayCircleOutline sx={{ fontSize: 64 }} />
          <Typography variant="caption" sx={{ mt: 1 }}>
            Video Thumbnail
          </Typography>
        </Box>
      </CardMedia>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" noWrap>
          {video.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {video.filename}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default VideoCard;

