import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import { Menu, MenuItem, IconButton, Button } from '@mui/material';
import config from '../config';

const NotificationBell = ({ isNavbarDark }) => {
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${config.apiUrl}/api/notifications`, { withCredentials: true });
            setNotifications(res.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`${config.apiUrl}/api/notifications/${id}/read`, {}, { withCredentials: true });
            setNotifications(prev =>
                prev.map(n => (n._id === id ? { ...n, read: true } : n))
            );
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.put(`${config.apiUrl}/api/notifications/mark-all-read`, {}, { withCredentials: true });
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <IconButton
                onClick={handleClick}
                className="relative hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-2"
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon className="text-gray-600" />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    className: 'bg-white dark:bg-gray-800 shadow-lg rounded-lg',
                    style: {
                        maxHeight: 300, // Limit height to 300px
                        overflowY: 'auto', // Scroll vertically when content exceeds height
                    },
                }}
            >
                {notifications.length === 0 ? (
                    <MenuItem disabled className="text-gray-500 dark:text-gray-400">
                        No notifications
                    </MenuItem>
                ) : (
                    <>
                        {notifications.map((notif) => (
                            <MenuItem
                                key={notif._id}
                                onClick={() => handleMarkAsRead(notif._id)}
                                className={`block whitespace-normal ${notif.read ? 'font-normal text-gray-700 dark:text-gray-300' : 'font-bold text-black dark:text-white'
                                    }`}
                            >
                                <div>{notif.message}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(notif.createdAt).toLocaleString()}
                                </div>
                            </MenuItem>
                        ))}
                        <div className="px-4 py-2">
                            <Button
                                onClick={handleMarkAllAsRead}
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="small"
                            >
                                Mark All as Read
                            </Button>
                        </div>
                    </>
                )}
            </Menu>
        </>
    );
};

export default NotificationBell;