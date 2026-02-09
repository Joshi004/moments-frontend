import React from 'react';
import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { Link as LinkIcon, VideoLibrary } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
      }}
    >
      <Box
        sx={{
          flex: { xs: '1 1 100%', md: '1 1 0' },
          minWidth: 0,
        }}
      >
        <Card
          sx={{
            height: '100%',
            transition: 'box-shadow 0.3s, transform 0.2s',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <CardActionArea onClick={() => navigate('/generate')} sx={{ height: '100%' }}>
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 2,
                px: 2.5,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  flexShrink: 0,
                }}
              >
                <LinkIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                  Generate from URL
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create moments from any video URL
                </Typography>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>

      <Box
        sx={{
          flex: { xs: '1 1 100%', md: '1 1 0' },
          minWidth: 0,
        }}
      >
        <Card
          sx={{
            height: '100%',
            transition: 'box-shadow 0.3s, transform 0.2s',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <CardActionArea onClick={() => navigate('/videos')} sx={{ height: '100%' }}>
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 2,
                px: 2.5,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  flexShrink: 0,
                }}
              >
                <VideoLibrary sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                  View Video Library
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse and manage your videos
                </Typography>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </Box>
  );
};

export default QuickActions;
