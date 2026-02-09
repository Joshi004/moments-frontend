import React from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, Grid } from '@mui/material';
import { VideoLibrary, Link as LinkIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to VideoMoments"
      />
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The full dashboard with stats and activity feed is coming soon. Use the quick links below to get started.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardActionArea onClick={() => navigate('/videos')}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <VideoLibrary sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">Video Library</Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse and manage your videos
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardActionArea onClick={() => navigate('/generate')}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <LinkIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">Generate from URL</Typography>
                <Typography variant="body2" color="text.secondary">
                  Create moments from a video URL
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
