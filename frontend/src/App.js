/**
 * @fileoverview Main application file for the Task Management App.
 * Sets up routing, authentication, and theme management for the application.
 * Provides routes for various components such as Login, Signup, Tasks, Groups, and more.
 * @module App
 * @requires react
 * @requires react-toastify
 * @requires react-router-dom
 * @requires @mui/material
 * @requires axios
 * @requires ./components/Home
 * @requires ./components/Login
 * @requires ./components/Signup
 * @requires ./components/Groups
 * @requires ./components/MyThemedComponent
 * @requires ./components/ForgotPassword
 * @requires ./components/Task
 * @requires ./components/Users
 * @requires ./components/ResetPassword
 * @requires ./config
 */

import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Groups from './components/Groups';
import MyThemedComponent from './components/MyThemedComponent';
import config from './config';
import './App.css';
import axios from 'axios';
import ForgotPassword from './components/ForgotPassword';
import Task from './components/Task';
import Users from './components/Users';
import ResetPassword from './components/ResetPassword';

// Create Theme Context
const ThemeContext = createContext();

/**
 * ThemeProvider component - Provides theme-related state and functionality to the application.
 * Manages light, dark, and system themes and persists the selected theme in localStorage.
 * @function ThemeProvider
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components that will consume the theme context.
 * @returns {JSX.Element} The ThemeProvider component.
 */
const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const storedTheme = localStorage.getItem('appTheme');
    if (storedTheme) {
      return storedTheme;
    }
    return 'system';
  });

  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    localStorage.setItem('appTheme', themeMode);
  }, [themeMode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
        },
      }),
    [isDarkMode],
  );

  const toggleTheme = useCallback(() => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  const enableLightTheme = useCallback(() => setThemeMode('light'), []);
  const enableDarkTheme = useCallback(() => setThemeMode('dark'), []);
  const enableSystemTheme = useCallback(() => setThemeMode('system'), []);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, enableLightTheme, enableDarkTheme, enableSystemTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use the theme context.
 * @function useTheme
 * @returns {Object} The theme context value.
 */
export const useTheme = () => useContext(ThemeContext);

axios.defaults.withCredentials = true;

/**
 * App component - The main application component.
 * Sets up routing and authentication for the application.
 * @function App
 * @returns {JSX.Element} The rendered App component.
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track user authentication.
  const [isLoading, setIsLoading] = useState(true); // State to track loading status.
  const { themeMode } = useTheme(); // Use the theme context.

  /**
   * Verifies the user's authentication token when the app loads.
   * @async
   * @function verifyToken
   * @returns {Promise<void>}
   */
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/users/verify`);

        if (response.data.message === 'JWT is valid' && sessionStorage.getItem('userId') !== null && sessionStorage.getItem('userName') !== null) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return (
      <MuiThemeProvider theme={createTheme()}> {/* Use a default theme for loading */}
        <CssBaseline />
        <Container
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress />
        </Container>
      </MuiThemeProvider>
    );
  }

  return (
    <Router>
      <div className={`App theme-${themeMode}`}>
        <Container>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/tasks" element={isAuthenticated ? <Task /> : <Navigate to="/login" />} />
            <Route path="/groups" element={isAuthenticated ? <Groups /> : <Navigate to="/login" />} />
            <Route path="/users" element={isAuthenticated ? <Users /> : <Navigate to="/login" />} />
            <Route path="/themed-page" element={<MyThemedComponent />} />
          </Routes>
        </Container>
      </div>
      <ToastContainer />
    </Router>
  );
}

/**
 * Root component - Wraps the App component with the ThemeProvider.
 * @function Root
 * @returns {JSX.Element} The Root component.
 */
export default function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}