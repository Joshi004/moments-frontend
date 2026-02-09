import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';
import { ThemeContextProvider, useThemeMode } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ToastContainer from './components/notifications/ToastContainer';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import URLGeneratePage from './pages/URLGeneratePage';
import PipelineMonitorPage from './pages/PipelineMonitorPage';
import SettingsPage from './pages/SettingsPage';
import DashboardPage from './pages/DashboardPage';
import VideoDetailPage from './pages/VideoDetailPage';

// Inner component that consumes theme mode
const AppContent = () => {
  const { mode } = useThemeMode();
  const theme = React.useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NotificationProvider>
          <AppLayout>
            <Routes>
              {/* New routes */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/videos/:id" element={<VideoDetailPage />} />
              <Route path="/videos" element={<HomePage />} />
              <Route path="/generate" element={<URLGeneratePage />} />
              <Route path="/pipelines" element={<PipelineMonitorPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* Redirects from old routes */}
              <Route path="/url-generate" element={<Navigate to="/generate" replace />} />
              <Route path="/pipeline-history" element={<Navigate to="/pipelines" replace />} />
              <Route path="/admin" element={<Navigate to="/settings" replace />} />
              
              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
          <ToastContainer />
        </NotificationProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

function App() {
  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  );
}

export default App;
