import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import URLGeneratePage from './pages/URLGeneratePage';
import PipelineHistoryPage from './pages/PipelineHistoryPage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* New routes */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/videos" element={<HomePage />} />
            <Route path="/generate" element={<URLGeneratePage />} />
            <Route path="/pipelines" element={<PipelineHistoryPage />} />
            <Route path="/settings" element={<AdminPage />} />
            
            {/* Redirects from old routes */}
            <Route path="/url-generate" element={<Navigate to="/generate" replace />} />
            <Route path="/pipeline-history" element={<Navigate to="/pipelines" replace />} />
            <Route path="/admin" element={<Navigate to="/settings" replace />} />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
