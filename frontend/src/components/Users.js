/**
 * @fileoverview Users component for managing and displaying user information.
 * Allows fetching, displaying, and editing user details.
 * @module Users
 * @requires react
 * @requires axios
 * @requires @mui/material
 * @requires @mui/icons-material
 * @requires ./Navbar
 * @requires ../config
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    IconButton,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Navbar from './Navbar';
import config from '../config';

/**
 * Users component - Renders a list of users and provides functionality to edit user details.
 * @function Users
 * @returns {JSX.Element} The rendered Users component.
 */
function Users() {
    const [users, setUsers] = useState([]); // State to store the list of users.
    const [editingUser, setEditingUser] = useState(null); // State to store the user being edited.
    const [editOpen, setEditOpen] = useState(false); // State to control the visibility of the edit dialog.

    /**
     * Fetches the list of users from the server when the component mounts.
     * @async
     * @function fetchUsers
     * @returns {Promise<void>}
     */
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/users`, { withCredentials: true });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    /**
     * Opens the edit dialog for a specific user.
     * @function handleEditUser
     * @param {Object} user - The user object to be edited.
     */
    const handleEditUser = (user) => {
        setEditingUser({ ...user });
        setEditOpen(true);
    };

    /**
     * Sends an update request to the server to modify user details.
     * @async
     * @function handleUpdateUser
     * @param {string} userId - The ID of the user being updated.
     * @returns {Promise<void>}
     */
    const handleUpdateUser = async (userId) => {
        try {
            await axios.put(`${config.apiUrl}/api/users/${userId}`, editingUser, { withCredentials: true });
            setEditingUser(null);
            setEditOpen(false);
            // Re-fetch users after updating
            const response = await axios.get(`${config.apiUrl}/api/users`, { withCredentials: true });
            setUsers(response.data);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    /**
     * Closes the edit dialog without saving changes.
     * @function handleClose
     */
    const handleClose = () => {
        setEditOpen(false);
    };

    return (
        <div>
            <Navbar />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Users
            </Typography>

            {/* Display the list of users */}
            <Grid container spacing={3} style={{ padding: '16px' }}>
                {users.map((user) => (
                    <Grid item key={user._id} xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {user.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Username: {user.username}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                {sessionStorage.getItem('userId') === user._id && (
                                    <IconButton onClick={() => handleEditUser(user)}>
                                        <EditIcon />
                                    </IconButton>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Dialog for editing user */}
            <Dialog open={editOpen} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Name"
                        name="name"
                        value={editingUser?.name || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Username"
                        name="username"
                        value={editingUser?.username || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    {/* Additional fields for editing user details can be added here */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => handleUpdateUser(editingUser._id)} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Users;