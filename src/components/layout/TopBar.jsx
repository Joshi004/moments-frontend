import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import {
  MenuOutlined,
  SearchOutlined,
  NotificationsOutlined,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../theme';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/videos': 'Video Library',
  '/generate': 'Generate from URL',
  '/pipelines': 'Pipelines',
  '/settings': 'Settings',
};

const titleCase = (str) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const TopBar = ({ onMenuToggle, sidebarOpen, isMobile }) => {
  const location = useLocation();

  // Get page title
  const getPageTitle = () => {
    const title = PAGE_TITLES[location.pathname];
    if (title) return title;

    // Fallback: title-case the last path segment
    const segments = location.pathname.split('/').filter(x => x);
    if (segments.length > 0) {
      return titleCase(segments[segments.length - 1]);
    }

    return 'Dashboard';
  };

  const pageTitle = getPageTitle();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        ml: isMobile ? 0 : (sidebarOpen ? `${SIDEBAR_WIDTH / 8}px` : `${SIDEBAR_COLLAPSED_WIDTH / 8}px`),
        width: isMobile ? '100%' : `calc(100% - ${sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}px)`,
        transition: (theme) =>
          theme.transitions.create(['margin-left', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
      }}
    >
      <Toolbar>
        {/* Menu toggle button */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={onMenuToggle}
          sx={{ mr: 2 }}
        >
          <MenuOutlined />
        </IconButton>

        {/* Page title and breadcrumbs */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
            {pageTitle}
          </Typography>
          <Breadcrumbs />
        </Box>

        {/* Right side: placeholder search and notifications */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="inherit" disabled>
            <SearchOutlined />
          </IconButton>
          <IconButton color="inherit" disabled>
            <NotificationsOutlined />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
