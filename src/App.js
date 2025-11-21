import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import HomePage from './pages/HomePage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF0000', // YouTube red
    },
    secondary: {
      main: '#606060', // YouTube gray
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#030303',
      secondary: '#606060',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 400,
    },
    h3: {
      fontWeight: 400,
      fontSize: '1.5rem',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HomePage />
    </ThemeProvider>
  );
}

export default App;
