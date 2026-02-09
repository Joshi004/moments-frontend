import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import KeyboardShortcutsDialog from '../common/KeyboardShortcutsDialog';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, TOPBAR_HEIGHT, CONTENT_MAX_WIDTH } from '../../theme';

const AppLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900-1200px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px

  // Initialize sidebar state from localStorage, default to true
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : true;
  });

  // Keyboard shortcuts dialog state
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);

  // Auto-adjust sidebar based on screen size
  useEffect(() => {
    if (isMobile) {
      // Mobile: sidebar closed (temporary drawer)
      setSidebarOpen(false);
    } else if (isTablet) {
      // Tablet: collapsed sidebar (icon-only)
      setSidebarOpen(false);
    } else if (isDesktop) {
      // Desktop: restore from localStorage
      const saved = localStorage.getItem('sidebarOpen');
      setSidebarOpen(saved ? JSON.parse(saved) : true);
    }
  }, [isMobile, isTablet, isDesktop]);

  const handleSidebarToggle = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    // Only persist to localStorage on desktop
    if (!isMobile) {
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
    }
  };

  // Global keyboard listener for '?' key
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger if not typing in an input, textarea, or contenteditable
      const isTyping = 
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable;

      if (e.key === '?' && !isTyping) {
        e.preventDefault();
        setShortcutsDialogOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
          pt: { xs: 2, md: 3 },
          pr: { xs: 2, md: 3 },
          pb: { xs: 2, md: 3 },
          pl: { xs: 2, md: 0 },
          maxWidth: CONTENT_MAX_WIDTH,
          width: '100%',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        open={shortcutsDialogOpen}
        onClose={() => setShortcutsDialogOpen(false)}
      />
    </Box>
  );
};

export default AppLayout;
