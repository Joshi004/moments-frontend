import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, TOPBAR_HEIGHT, CONTENT_MAX_WIDTH } from '../../theme';

const AppLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Initialize sidebar state from localStorage, default to true
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : true;
  });

  // Auto-collapse sidebar on mobile, restore from localStorage on desktop
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      const saved = localStorage.getItem('sidebarOpen');
      setSidebarOpen(saved ? JSON.parse(saved) : true);
    }
  }, [isMobile]);

  const handleSidebarToggle = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    // Only persist to localStorage on desktop
    if (!isMobile) {
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} isMobile={isMobile} />
      <TopBar onMenuToggle={handleSidebarToggle} sidebarOpen={sidebarOpen} isMobile={isMobile} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: `${TOPBAR_HEIGHT}px`,
          ml: isMobile ? 0 : (sidebarOpen ? `${SIDEBAR_WIDTH}px` : `${SIDEBAR_COLLAPSED_WIDTH}px`),
          transition: theme.transitions.create(['margin-left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          p: { xs: 2, md: 3 },
          maxWidth: CONTENT_MAX_WIDTH,
          width: '100%',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;
