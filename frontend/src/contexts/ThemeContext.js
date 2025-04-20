/**
 * @fileoverview ThemeContext for managing and providing theme-related state and functionality.
 * Allows toggling between light, dark, and system themes and persists the selected theme in localStorage.
 * @module ThemeContext
 * @requires react
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';

// Create a context for theme management.
export const ThemeContext = createContext();

/**
 * ThemeProvider component - Provides theme-related state and functionality to its children.
 * @function ThemeProvider
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components that will consume the theme context.
 * @returns {JSX.Element} The ThemeProvider component.
 */
export const ThemeProvider = ({ children }) => {
    // State to manage the current theme.
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('appTheme'); // Retrieve the theme from localStorage.
        if (storedTheme) {
            return storedTheme;
        }
        return 'system'; // Default to system theme if no theme is stored.
    });

    // Determine if dark mode is active based on the theme and system preferences.
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    /**
     * Toggles between light and dark themes.
     * @function toggleTheme
     */
    const toggleTheme = useCallback(() => {
        setTheme((prevTheme) => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('appTheme', newTheme); // Persist the new theme in localStorage.
            return newTheme;
        });
    }, []);

    /**
     * Enables the light theme.
     * @function enableLightTheme
     */
    const enableLightTheme = useCallback(() => {
        setTheme('light');
        localStorage.setItem('appTheme', 'light'); // Persist the light theme in localStorage.
    }, []);

    /**
     * Enables the dark theme.
     * @function enableDarkTheme
     */
    const enableDarkTheme = useCallback(() => {
        setTheme('dark');
        localStorage.setItem('appTheme', 'dark'); // Persist the dark theme in localStorage.
    }, []);

    /**
     * Enables the system theme, which adapts to the user's system preferences.
     * @function enableSystemTheme
     */
    const enableSystemTheme = useCallback(() => {
        setTheme('system');
        localStorage.setItem('appTheme', 'system'); // Persist the system theme in localStorage.
    }, []);

    // Persist the theme in localStorage whenever it changes.
    useEffect(() => {
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider
            value={{
                theme, // The current theme.
                isDarkMode, // Whether dark mode is active.
                toggleTheme, // Function to toggle between light and dark themes.
                enableLightTheme, // Function to enable the light theme.
                enableDarkTheme, // Function to enable the dark theme.
                enableSystemTheme, // Function to enable the system theme.
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};