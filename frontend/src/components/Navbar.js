/**
 * @fileoverview Navbar component for the application.
 * Provides navigation links, theme toggles, and user profile options.
 * @module Navbar
 * @requires react
 * @requires react-router-dom
 * @requires ../App
 * @requires ../config
 * @requires axios
 * @requires ./../assets/images.png
 * @requires lucide-react
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../App';
import config from '../config';
import axios from 'axios';
import logo from './../assets/images.png';
import { Sun, Moon, Monitor, LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';

/**
 * Navbar component - Renders the navigation bar with links, theme toggles, and user profile options.
 * @function Navbar
 * @returns {JSX.Element} The rendered Navbar component.
 */
function Navbar() {
    const { themeMode, enableLightTheme, enableDarkTheme, enableSystemTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);

    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName') || 'User';
    const userEmail = sessionStorage.getItem('userEmail') || '';

    /**
     * Determines if the navbar is in dark mode based on the theme.
     * @returns {boolean} True if the navbar is in dark mode, false otherwise.
     */
    const isNavbarDark = themeMode === 'dark';

    /**
     * Generates initials from the user's name.
     * @function getInitials
     * @param {string} name - The user's full name.
     * @returns {string} The initials of the user's name.
     */
    const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        let initials = names[0][0]?.toUpperCase() || '';
        if (names.length > 1) initials += names[names.length - 1][0]?.toUpperCase() || '';
        return initials;
    };

    /**
     * Handles user logout by making an API call and redirecting to the login page.
     * @async
     * @function handleLogout
     * @returns {Promise<void>}
     */
    const handleLogout = async () => {
        setMenuOpen(false);
        try {
            const timestamp = Date.now();
            const response = await axios.get(`${config.apiUrl}/api/users/logout?t=${timestamp}`, {
                withCredentials: true,
            });
            if (response.data.message === 'Logged out successfully') {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <>
            <header className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-neutral-700">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo and name */}
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="logo" className="h-10 w-10 object-contain" />
                            <Link to="/" className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                                SyncEdge
                            </Link>
                        </div>

                        {/* Nav links (hidden on mobile) */}
                        <nav className="hidden md:flex gap-4">
                            <NavBtn to="/tasks" label="Dashboard" />
                            <NavBtn to="/groups" label="Groups" />
                            <NavBtn to="/users" label="Users" />
                        </nav>

                        {/* Theme + Profile */}
                        <div className="flex items-center gap-4">
                            {/* Theme toggle (hidden on mobile) */}
                            <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-neutral-800 rounded-full px-2 py-1">
                                <IconBtn title="Light" active={themeMode === 'light'} onClick={enableLightTheme}>
                                    <Sun className="w-4 h-4" />
                                </IconBtn>
                                <IconBtn title="Dark" active={themeMode === 'dark'} onClick={enableDarkTheme}>
                                    <Moon className="w-4 h-4" />
                                </IconBtn>
                                <IconBtn title="System" active={themeMode === 'system'} onClick={enableSystemTheme}>
                                    <Monitor className="w-4 h-4" />
                                </IconBtn>
                            </div>

                            {/* Notification Bell */}
                            <NotificationBell isNavbarDark={isNavbarDark} />

                            {/* Avatar menu */}
                            <div className="relative">
                                <button
                                    className="w-9 h-9 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center text-sm"
                                    onClick={() => setMenuOpen(!menuOpen)}
                                >
                                    {getInitials(userName)}
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-700">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{userEmail}</p>
                                        </div>

                                        {/* Nav for mobile */}
                                        <div className="md:hidden flex flex-col">
                                            <LinkMenuItem to="/tasks" label="Dashboard" />
                                            <LinkMenuItem to="/groups" label="Groups" />
                                            <LinkMenuItem to="/users" label="Users" />
                                            <div className="flex px-4 py-2 gap-2">
                                                <IconBtn title="Light" active={themeMode === 'light'} onClick={enableLightTheme}>
                                                    <Sun className="w-4 h-4" />
                                                </IconBtn>
                                                <IconBtn title="Dark" active={themeMode === 'dark'} onClick={enableDarkTheme}>
                                                    <Moon className="w-4 h-4" />
                                                </IconBtn>
                                                <IconBtn title="System" active={themeMode === 'system'} onClick={enableSystemTheme}>
                                                    <Monitor className="w-4 h-4" />
                                                </IconBtn>
                                            </div>
                                        </div>

                                        <button
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-neutral-700 flex items-center gap-2"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Spacer */}
            <div className="h-16" />
        </>
    );
}

/**
 * Navigation button component for the Navbar.
 * @function NavBtn
 * @param {Object} props - Component props.
 * @param {string} props.to - The link destination.
 * @param {string} props.label - The label for the navigation button.
 * @returns {JSX.Element} The rendered NavBtn component.
 */
const NavBtn = ({ to, label }) => (
    <Link
        to={to}
        className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white px-2 py-1 transition"
    >
        {label}
    </Link>
);

/**
 * Link menu item component for the mobile Navbar.
 * @function LinkMenuItem
 * @param {Object} props - Component props.
 * @param {string} props.to - The link destination.
 * @param {string} props.label - The label for the menu item.
 * @returns {JSX.Element} The rendered LinkMenuItem component.
 */
const LinkMenuItem = ({ to, label }) => (
    <Link
        to={to}
        className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700"
    >
        {label}
    </Link>
);

/**
 * Icon button component for theme toggles.
 * @function IconBtn
 * @param {Object} props - Component props.
 * @param {string} props.title - The title for the button.
 * @param {Function} props.onClick - The click handler function.
 * @param {boolean} props.active - Whether the button is active.
 * @param {JSX.Element} props.children - The icon to display inside the button.
 * @returns {JSX.Element} The rendered IconBtn component.
 */
const IconBtn = ({ title, onClick, active, children }) => (
    <button
        title={title}
        onClick={onClick}
        className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            }`}
    >
        {children}
    </button>
);

export default Navbar;
