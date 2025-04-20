/**
 * @fileoverview React component for managing groups and their members
 * @module Groups
 * @requires react
 * @requires axios
 * @requires @mui/material
 * @requires ./Navbar
 * @requires ../config
 * @requires react-toastify
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
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from './Navbar';
import config from '../config';
import { toast } from 'react-toastify';

/**
 * Groups component - Manages group creation, editing, and deletion
 * @function Groups
 * @returns {JSX.Element} The rendered groups management interface
 */
function Groups() {
    const [groups, setGroups] = useState([]);
    const [newGroup, setNewGroup] = useState({ name: '', members: [] });
    const [editingGroup, setEditingGroup] = useState(null);
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false); // State for the edit dialog

    /**
     * Fetches groups and users data on component mount
     * @effect
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
        fetchGroups();
        fetchUsers();
    }, []);

    /**
     * Fetches groups from the API
     * @async
     * @function fetchGroups
     * @returns {Promise<void>}
     */
    const fetchGroups = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/groups`, { withCredentials: true });
            setGroups(response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    /**
         * Handles changes in group form fields
         * @function handleGroupChange
         * @param {Object} event - The change event
    */
    const handleGroupChange = (event) => {
        setNewGroup({ ...newGroup, [event.target.name]: event.target.value });
    };

    /**
     * Handles changes in members selection
     * @function handleMemberChange
     * @param {Object} event - The change event
     */
    const handleMemberChange = (event) => {
        setNewGroup({ ...newGroup, members: event.target.value });
    };

    /**
     * Creates a new group
     * @async
     * @function handleCreateGroup
     * @returns {Promise<void>}
     */
    const handleCreateGroup = async () => {
        try {
            await axios.post(`${config.apiUrl}/api/groups`, newGroup, { withCredentials: true });
            setNewGroup({ name: '', members: [] });
            setOpen(false);
            fetchGroups();
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    /**
     * Updates an existing group
     * @async
     * @function handleUpdateGroup
     * @param {string} groupId - The ID of the group to update
     * @returns {Promise<void>}
     */
    const handleEditGroup = (group) => {
        setEditingGroup({ ...group });
        setEditOpen(true);
    };

    /**
     * Updates an existing group
     * @async
     * @function handleUpdateGroup
     * @param {string} groupId - The ID of the group to update
     * @returns {Promise<void>}
     */
    const handleUpdateGroup = async (groupId) => {
        try {
            await axios.put(`${config.apiUrl}/api/groups/${groupId}`, editingGroup, { withCredentials: true });
            setEditingGroup(null);
            setEditOpen(false);
            fetchGroups();
        } catch (error) {
            toast.error(`Error updating group: Groups can only be deleted by owner!`)
            console.error('Error updating group:', error);
        }
    };

    /**
     * Updates an existing group
     * @async
     * @function handleUpdateGroup
     * @param {string} groupId - The ID of the group to update
     * @returns {Promise<void>}
     */
    const handleDeleteGroup = async (groupId) => {
        try {
            await axios.delete(`${config.apiUrl}/api/groups/${groupId}`, { withCredentials: true });
            fetchGroups();
        } catch (error) {
            toast.error(`Error deleting group: Groups can only be deleted by owner!`)
            console.error('Error deleting group:', error);
        }
    };

    /**
     * Opens the create group dialog
     * @function handleOpen
     */
    const handleOpen = () => {
        setOpen(true);
    };

    /**
     * Closes all dialogs
     * @function handleClose
     */
    const handleClose = () => {
        setOpen(false);
        setEditOpen(false);
    };

    return (
        <div>
            <Navbar />
            <Grid container justifyContent="space-between" alignItems="center" style={{ padding: '16px' }}>
                <Grid item>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Group Board
                    </Typography>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={handleOpen}>
                        Create Group
                    </Button>
                </Grid>
            </Grid>

            <Grid container spacing={3} style={{ padding: '16px' }}>
                {groups.map((group) => (
                    <Grid item key={group._id} xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {group.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Members: {group.members.map(member => users.find(user => user._id === member)?.name || member).join(', ')}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                {sessionStorage.getItem('userId') === group.owner &&
                                    <>
                                        <IconButton onClick={() => handleEditGroup(group)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteGroup(group._id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                }
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Create New Group</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Group Name"
                        name="name"
                        value={newGroup.name}
                        onChange={handleGroupChange}
                        fullWidth
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="members-label">Members</InputLabel>
                        <Select
                            labelId="members-label"
                            id="members"
                            multiple
                            value={newGroup.members}
                            label="Members"
                            onChange={handleMemberChange}
                            renderValue={(selected) => (
                                <div>
                                    {selected.map((value) => (
                                        <Chip key={value} label={users.find(user => user._id === value)?.name || value} />
                                    ))}
                                </div>
                            )}
                        >
                            {users.map((user) => (
                                <MenuItem key={user._id} value={user._id}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleCreateGroup} color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editOpen} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Edit Group</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Group Name"
                        name="name"
                        value={editingGroup?.name || ''}
                        onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="edit-members-label">Members</InputLabel>
                        <Select
                            labelId="edit-members-label"
                            id="edit-members"
                            multiple
                            value={editingGroup?.members || []}
                            label="Members"
                            onChange={(e) => setEditingGroup({ ...editingGroup, members: e.target.value })}
                            renderValue={(selected) => (
                                <div>
                                    {selected.map((value) => (
                                        <Chip key={value} label={users.find(user => user._id === value)?.name || value} />
                                    ))}
                                </div>
                            )}
                        >
                            {users.map((user) => (
                                <MenuItem key={user._id} value={user._id}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {editingGroup?.owner &&
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="edit-owner-label">Transfer ownership</InputLabel>
                            <Select
                                labelId="owner-label"
                                id="owner"
                                name="transfer_ownership"
                                value={editingGroup?.owner}
                                label="Transfer Ownership"
                                onChange={(e) => setEditingGroup({ ...editingGroup, owner: e.target.value })}
                            >
                                {users.map((user) => (
                                    <MenuItem key={user._id} value={user._id}>
                                        {user.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => handleUpdateGroup(editingGroup?._id)} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Groups;