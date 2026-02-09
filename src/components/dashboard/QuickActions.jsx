import React from 'react';
import { Grid, Card, CardActionArea, CardContent, Box, Typography } from '@mui/material';
import { Link as LinkIcon, VideoLibrary } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
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
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <LinkIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Generate from URL
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create moments from any video URL
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
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
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <VideoLibrary sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                View Video Library
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse and manage your videos
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    </Grid>
  );
};

export default QuickActions;
