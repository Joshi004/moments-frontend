import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { useLocation, Link as RouterLink } from 'react-router-dom';

const ROUTE_LABELS = {
  '': 'Dashboard',
  'videos': 'Videos',
  'generate': 'Generate',
  'pipelines': 'Pipelines',
  'settings': 'Settings',
};

const titleCase = (str) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Don't show breadcrumbs on root path
  if (pathnames.length === 0) {
    return null;
  }

  return (
    <MuiBreadcrumbs
      separator={<NavigateNext fontSize="small" />}
      sx={{ fontSize: '0.75rem' }}
    >
      {/* Always show Dashboard as root */}
      <Link
        component={RouterLink}
        to="/"
        underline="hover"
        color="inherit"
        sx={{ fontSize: '0.75rem' }}
      >
        Dashboard
      </Link>

      {pathnames.map((segment, index) => {
        const path = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const previousSegment = index > 0 ? pathnames[index - 1] : null;
        
        // Special handling for video detail pages (/videos/:id)
        let label;
        if (previousSegment === 'videos' && !ROUTE_LABELS[segment]) {
          // This is a video ID, show "Video Detail"
          label = 'Video Detail';
        } else {
          label = ROUTE_LABELS[segment] || titleCase(segment);
        }

        if (isLast) {
          return (
            <Typography
              key={path}
              color="text.primary"
              sx={{ fontSize: '0.75rem', fontWeight: 500 }}
            >
              {label}
            </Typography>
          );
        }

        return (
          <Link
            key={path}
            component={RouterLink}
            to={path}
            underline="hover"
            color="inherit"
            sx={{ fontSize: '0.75rem' }}
          >
            {label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
