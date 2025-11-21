import React, { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { PlayCircleOutline } from '@mui/icons-material';
import { getThumbnailUrl } from '../services/api';

const VideoCard = ({ video, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const thumbnailUrl = video.thumbnail_url 
    ? `http://localhost:8005${video.thumbnail_url}`
    : getThumbnailUrl(video.id);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          '& .play-overlay': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            '& .MuiSvgIcon-root': {
              opacity: 0.9,
            },
          },
        },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: 'background.paper',
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio
          backgroundColor: 'grey.300',
          overflow: 'hidden',
        }}
      >
        {!imageLoaded && (
          <Skeleton
            variant="rectangular"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        )}
        {!imageError && thumbnailUrl && (
          <Box
            component="img"
            src={thumbnailUrl}
            alt={video.title}
            onLoad={handleImageLoad}
            onError={handleImageError}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: imageLoaded ? 'block' : 'none',
            }}
          />
        )}
        {(imageError || !thumbnailUrl) && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'grey.600',
              backgroundColor: 'grey.200',
            }}
          >
            <PlayCircleOutline sx={{ fontSize: 64, opacity: 0.5 }} />
          </Box>
        )}
        {/* Play button overlay on hover */}
        <Box
          className="play-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            transition: 'background-color 0.2s ease-in-out',
          }}
        >
          <PlayCircleOutline
            sx={{
              fontSize: 64,
              color: 'white',
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
            }}
          />
        </Box>
      </Box>
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: 1.5,
          '&:last-child': {
            paddingBottom: 1.5,
          },
        }}
      >
        <Typography
          variant="subtitle1"
          component="h3"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
            mb: 0.5,
            color: 'text.primary',
          }}
        >
          {video.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '0.75rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mt: 'auto',
          }}
        >
          {video.filename}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default VideoCard;

