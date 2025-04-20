/**
 * @fileoverview React component for managing tasks in a Kanban-style board
 * @module Tasks
 * @requires react
 * @requires axios
 * @requires @mui/material
 * @requires @mui/icons-material
 * @requires react-toastify
 * @requires ./Navbar
 * @requires ./StatusDropdown
 * @requires ../config
 * @requires @mui/x-date-pickers
 * @requires dayjs
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import DeleteIcon from '@mui/icons-material/Delete';
import Avatar from '@mui/material/Avatar';
import CircleIcon from '@mui/icons-material/Circle';
import HistoryIcon from '@mui/icons-material/History';
import {
    Button,
    Typography,
    Container,
    Grid,
    Card,
    CardContent,
    CardActions,
    Modal,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    Tooltip,
    Popover,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
} from '@mui/material';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import StatusDropdown from './StatusDropdown';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonIcon from '@mui/icons-material/Person';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BugReportIcon from '@mui/icons-material/BugReport';
import StoryIcon from '@mui/icons-material/Book';
import TaskIcon from '@mui/icons-material/Assignment';
import SubtaskIcon from '@mui/icons-material/AssignmentTurnedIn';
import EpicIcon from '@mui/icons-material/Stars';
import LinkIcon from '@mui/icons-material/Link';
import AddLinkIcon from '@mui/icons-material/AddLink';

/**
 * Style object for modal positioning and appearance
 * @constant
 * @type {Object}
 */
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    height: 550,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflow: 'auto',
};

/**
 * Mapping of status values to column names
 * @constant
 * @type {Object}
 */
export const statusColumns = {
    1: 'Requirement Gathering',
    2: 'In Dev',
    3: 'Dev Completed',
    4: 'In Testing',
    5: 'Testing Done',
    6: 'Done',
};

/**
 * Mapping of task types to display names
 * @constant
 * @type {Object}
 */
const taskTypes = {
    'task': 'Task',
    'user-story': 'User Story',
    'epic': 'Epic',
    'subtask': 'Subtask',
    'bug': 'Bug'
};

/**
 * Main Task component for displaying and managing tasks
 * @function Task
 * @returns {JSX.Element} The rendered task management interface
 */
function Task() {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [open, setOpen] = useState(false);
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        link: '',
        tags: '',
        group: '',
        status: 1,
        completed: false,
        visibility: 'private',
        assigned_by: null,
        assigned_to: null,
        priority: 'Medium',
        dueDate: null,
        type: 'task',
        linkedTasks: []
    });
    const [editingTask, setEditingTask] = useState(null);
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
    const [selectedUserFilter, setSelectedUserFilter] = useState('all');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [userFilterAnchorEl, setUserFilterAnchorEl] = useState(null);
    const [auditOpen, setAuditOpen] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [availableTasks, setAvailableTasks] = useState([]);
    const [selectedTasksToLink, setSelectedTasksToLink] = useState([]);

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [groups]);

    useEffect(() => {
        let filtered = [...tasks];

        if (selectedGroupFilter !== 'all') {
            filtered = filtered.filter(task => task.group === selectedGroupFilter);
        }

        if (selectedUserFilter !== 'all') {
            if (selectedUserFilter === 'unassigned') {
                filtered = filtered.filter(task => !task.assigned_to);
            } else {
                filtered = filtered.filter(task => task.assigned_to === selectedUserFilter);
            }
        }

        setFilteredTasks(filtered);
    }, [selectedGroupFilter, selectedUserFilter, tasks]);

    const fetchGroups = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/groups`, { withCredentials: true });
            setGroups(response.data);

            const response_users = await axios.get(`${config.apiUrl}/api/users`, { withCredentials: true });
            setUsers(response_users.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/tasks`, { withCredentials: true });
            setTasks(response.data);
            setFilteredTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleGroupFilterChange = (event) => {
        setSelectedGroupFilter(event.target.value);
    };

    const handleUserFilterClick = (userId) => {
        setSelectedUserFilter(userId);
        setUserFilterAnchorEl(null);
    };

    const handleOpenFilterMenu = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleOpenUserFilterMenu = (event) => {
        setUserFilterAnchorEl(event.currentTarget);
    };

    const handleCloseFilterMenu = () => {
        setFilterAnchorEl(null);
    };

    const handleCloseUserFilterMenu = () => {
        setUserFilterAnchorEl(null);
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setEditingTask(null);
        setTaskData({
            title: '',
            description: '',
            link: '',
            tags: '',
            group: '',
            status: 1,
            completed: false,
            visibility: 'private',
            assigned_by: null,
            assigned_to: null,
            priority: 'Medium',
            dueDate: null,
            type: 'task',
            linkedTasks: []
        });
    };

    const handleChange = (event) => {
        if (taskData.status === "6" || (event.target.name === 'status' && event.target.value === "6")) {
            if (event.target.name === 'status' && event.target.value !== "6") {
                setTaskData({ ...taskData, [event.target.name]: event.target.value, completed: false });
                return
            } else {
                setTaskData({ ...taskData, [event.target.name]: event.target.value, completed: true });
                return;
            }
        }
        setTaskData({ ...taskData, [event.target.name]: event.target.value, completed: false });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!taskData.group && taskData.visibility === 'group') {
            toast.error('Please select a group.');
            return;
        }
        // if (taskData.link && !isValidUrl(taskData.link)) {
        //     toast.error('Please enter a valid Resource Link');
        //     return;
        // }
        if (taskData.assigned_by === null) {
            toast.error('Assigned by user cannot be blank');
            return;
        }

        if (taskData.assigned_to === null) {
            toast.error('Assigned to user cannot be blank');
            return;
        }

        if (taskData.dueDate === null || taskData.dueDate === "") {
            toast.error('Due Date cannot be blank');
            return;
        }

        if (taskData.dueDate === "Invalid Date") {
            toast.error('Due Date is invalid');
            return;
        }

        if (taskData.status === '6') {
            setTaskData({ ...taskData, completed: true });
        } else {
            setTaskData({ ...taskData, completed: false });
        }
        try {
            if (editingTask) {
                await axios.put(`${config.apiUrl}/api/tasks/${editingTask._id}`, taskData, { withCredentials: true });
                toast.success('Task updated!');
            } else {
                await axios.post(`${config.apiUrl}/api/tasks`, taskData, { withCredentials: true });
                toast.success('Task created!');
            }
            fetchTasks();
            handleClose();
        } catch (error) {
            console.error('Error creating/updating task:', error);
            toast.error('Failed to create/update task.');
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setTaskData({
            title: task.title,
            description: task.description,
            link: task.link,
            tags: task.tags,
            group: task.group,
            status: task.status,
            completed: task.completed,
            visibility: task.visibility,
            assigned_by: task.assigned_by,
            assigned_to: task.assigned_to,
            priority: task.priority,
            dueDate: task.dueDate || '',
            type: task.type,
            linkedTasks: task.linkedTasks
        });
        handleOpen();
    };

    const handleDelete = async (taskId) => {
        try {
            await axios.delete(`${config.apiUrl}/api/tasks/${taskId}`, { withCredentials: true });
            fetchTasks();
            toast.success('Task deleted!');
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task.');
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            let obj
            if (newStatus === '6') {
                obj = { status: newStatus, completed: true }
            } else {
                obj = { status: newStatus, completed: false }
            }
            await axios.put(`${config.apiUrl}/api/tasks/${taskId}`, obj, { withCredentials: true });
            fetchTasks();
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    /**
     * Validates whether a given string is a properly formatted URL.
     *
     * @param {string} url - The string to validate as a URL.
     * @returns {boolean} Returns `true` if the string is a valid URL, otherwise `false`.
     */
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Groups tasks by their status.
     *
     * @type {Object<string, Array<Object>>}
     * @property {Array<Object>} [status] - An array of task objects grouped by their status.
     * 
     * Example structure:
     * {
     *   "completed": [{ id: 1, name: "Task 1", status: "completed" }],
     *   "pending": [{ id: 2, name: "Task 2", status: "pending" }]
     * }
     */
    const groupedTasks = filteredTasks.reduce((acc, task) => {
        const status = task.status;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(task);
        return acc;
    }, {});

    /**
     * Retrieves the initials of a user based on their assigned ID.
     *
     * @param {string} assignedToId - The ID of the user to retrieve initials for.
     * @returns {string} The initials of the user in uppercase, or an empty string if the user or their name is not found.
     */
    const getInitials = (assignedToId) => {
        if (!assignedToId || !users) return '';
        const user = users.find((user) => user._id === assignedToId);
        if (!user || !user.name) return '';
        const names = user.name.split(' ');
        return names.map((n) => n[0]).join('').toUpperCase();
    };

    /**
     * Retrieves the tooltip text based on the assigned user's ID.
     *
     * @param {string} assignedToId - The ID of the user to whom the task is assigned.
     * @returns {string} The name of the assigned user if found, otherwise an empty string.
     */
    const getTooltip = (assignedToId) => {
        if (!assignedToId || !users) return '';
        const user = users.find((user) => user._id === assignedToId);
        if (!user || !user.name) return '';
        return user.name;
    };

    /**
         * An array of color codes represented as hexadecimal strings.
         * These colors can be used for styling purposes, such as assigning
         * different colors to tasks or UI elements.
         *
         * @constant {string[]}
         */
    const getColorFromId = (id) => {
        const colors = ['#1976d2', '#d32f2f', '#388e3c', '#f57c00', '#7b1fa2'];
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = (hash << 5) - hash + id.charCodeAt(i);
            hash |= 0;
        }
        return colors[Math.abs(hash) % colors.length];
    };

    /**
     * A mapping of task priority levels to their corresponding styles and icons.
     * Each priority level is associated with a color and an icon component.
     *
     * @constant
     * @type {Object.<string, { color: string, icon: JSX.Element }>}
     * @property {Object} High - Represents high priority with a red color and icon.
     * @property {string} High.color - The color code for high priority.
     * @property {JSX.Element} High.icon - The icon component for high priority.
     * @property {Object} Medium - Represents medium priority with an orange color and icon.
     * @property {string} Medium.color - The color code for medium priority.
     * @property {JSX.Element} Medium.icon - The icon component for medium priority.
     * @property {Object} Low - Represents low priority with a green color and icon.
     * @property {string} Low.color - The color code for low priority.
     * @property {JSX.Element} Low.icon - The icon component for low priority.
     */
    const priorityMap = {
        High: { color: '#d32f2f', icon: <CircleIcon sx={{ color: '#d32f2f', fontSize: 'small' }} /> },
        Medium: { color: '#f57c00', icon: <CircleIcon sx={{ color: '#f57c00', fontSize: 'small' }} /> },
        Low: { color: '#388e3c', icon: <CircleIcon sx={{ color: '#388e3c', fontSize: 'small' }} /> },
    };

    /**
     * Calculates the number of tasks assigned to each user.
     *
     * @returns {Object} An object where the keys are user IDs (or identifiers) 
     * and the values are the count of tasks assigned to each user.
     */
    const getUserTaskCounts = () => {
        const counts = {};
        tasks.forEach(task => {
            if (task.assigned_to) {
                counts[task.assigned_to] = (counts[task.assigned_to] || 0) + 1;
            }
        });
        return counts;
    };

    /**
     * Determines if a task is overdue.
     *
     * @param {Object} task - The task object to evaluate.
     * @param {string} [task.dueDate] - The due date of the task in ISO 8601 format.
     * @param {boolean} [task.completed] - Indicates whether the task is completed.
     * @returns {boolean} - Returns `true` if the task is overdue and not completed, otherwise `false`.
     */
    const isTaskOverdue = (task) => {
        if (!task.dueDate) return false;
        const dueDate = dayjs(task.dueDate);
        const today = dayjs().startOf('day');
        return dueDate.isBefore(today) && !task.completed;
    };

    const userTaskCounts = getUserTaskCounts();

    /**
     * Handles the opening of the audit logs for a specific task.
     * Fetches the audit logs for the given task ID from the API and updates the state to display them.
     *
     * @async
     * @function handleAuditOpen
     * @param {string} taskId - The ID of the task for which to fetch audit logs.
     * @returns {Promise<void>} - A promise that resolves when the audit logs are successfully fetched and the state is updated.
     * @throws {Error} - Logs an error to the console and displays a toast notification if fetching audit logs fails.
     */
    const handleAuditOpen = async (taskId) => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/tasks/${taskId}/audit`, { withCredentials: true });
            setAuditLogs(response.data);
            setAuditOpen(true);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            toast.error('Failed to fetch audit logs');
        }
    };

    /**
     * Asynchronously generates a task description using AI and updates the task data.
     * 
     * This function gathers task-related information, sends it to an API endpoint for
     * generating a description, and updates the task's description upon a successful response.
     * 
     * @async
     * @function handleGenerateDescription
     * @returns {Promise<void>} Resolves when the description is successfully generated and updated.
     * 
     * @throws {Error} Logs an error if the API request fails or encounters an exception.
     */
    const handleGenerateDescription = async () => {
        const aiInput = {
            assignedByName: users.find(user => user._id === taskData.assigned_by)?.name || '',
            assignedToName: users.find(user => user._id === taskData.assigned_to)?.name || '',
            title: taskData.title,
            tags: taskData.tags,
            resource_link: taskData.link,
            status: taskData.status,
            group: taskData.group,
            priority: taskData.priority,
            due_date: taskData.dueDate,
            type: taskData.type,
            linkedTasks: taskData.linkedTasks
        };

        try {
            const response = await fetch(`${config.apiUrl}/api/generate-description`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(aiInput),
            });

            if (response.ok) {
                const data = await response.json();
                setTaskData((prevData) => ({
                    ...prevData,
                    description: data.description,
                }));
            } else {
                console.error('Failed to generate description:', response.status);
            }
        } catch (error) {
            console.error('Error generating description:', error);
        }
    };

    const handleAuditClose = () => {
        setAuditOpen(false);
        setAuditLogs([]);
    };

    /**
     * Fetches the list of available tasks from the server, excluding the current task
     * and any tasks already linked to the current task.
     *
     * @async
     * @function fetchAvailableTasks
     * @param {string} currentTaskId - The ID of the current task to exclude from the available tasks.
     * @returns {Promise<void>} - A promise that resolves when the available tasks are fetched and set.
     * @throws {Error} - Logs an error to the console if the fetch operation fails.
     */
    const fetchAvailableTasks = async (currentTaskId) => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/tasks`, { withCredentials: true });
            const available = response.data.filter(task =>
                task._id !== currentTaskId &&
                (!taskData.linkedTasks || !taskData.linkedTasks.includes(task._id))
            );
            setAvailableTasks(available);
        } catch (error) {
            console.error('Error fetching available tasks:', error);
        }
    };

    /**
     * Handles the linking of tasks by updating the task data with the selected tasks to link.
     * Closes the link modal and resets the selected tasks to link.
     *
     * @async
     * @function handleLinkTasks
     * @returns {Promise<void>} Resolves when the task linking process is complete.
     */
    const handleLinkTasks = async () => {
        setTaskData({
            ...taskData,
            linkedTasks: [...(taskData.linkedTasks || []), ...selectedTasksToLink]
        });
        setLinkModalOpen(false);
        setSelectedTasksToLink([]);
    };

    return (
        <>
            <Navbar />
            <Container className="max-w-full px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Dashboard ({selectedGroupFilter === 'all' ? 'All Groups' : groups.find((group) => { if (group._id == selectedGroupFilter) { return group.name } })?.name})
                    </Typography>

                    <div className="flex space-x-4">
                        <Button
                            variant="outlined"
                            startIcon={<FilterListIcon />}
                            onClick={handleOpenFilterMenu}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium normal-case tracking-normal px-4 py-2 rounded-md shadow-sm"
                        //className='text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700'
                        >
                            Filters
                        </Button>
                        <Popover
                            open={Boolean(filterAnchorEl)}
                            anchorEl={filterAnchorEl}
                            onClose={handleCloseFilterMenu}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                        >
                            <div className="p-4 w-72">
                                <Typography variant="subtitle1" className="font-medium">Filter by:</Typography>
                                <Divider className="my-2" />

                                <FormControl fullWidth margin="normal" size="small">
                                    <InputLabel id="group-filter-label">Group</InputLabel>
                                    <Select
                                        labelId="group-filter-label"
                                        id="group-filter"
                                        value={selectedGroupFilter}
                                        label="Group"
                                        onChange={handleGroupFilterChange}
                                    >
                                        <MenuItem value="all">All Groups</MenuItem>
                                        {groups.length > 0 && groups.map((group) => (
                                            <MenuItem key={group._id} value={group._id}>
                                                {group.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Typography variant="subtitle2" className="mt-4 font-medium">Assigned To:</Typography>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<PersonIcon />}
                                    onClick={handleOpenUserFilterMenu}
                                    className="mt-2 justify-start"
                                >
                                    {selectedUserFilter === 'all'
                                        ? 'All Users'
                                        : selectedUserFilter === 'unassigned'
                                            ? 'Unassigned'
                                            : users.find(u => u._id === selectedUserFilter)?.name || 'Select User'}
                                </Button>
                            </div>
                        </Popover>

                        <Popover
                            open={Boolean(userFilterAnchorEl)}
                            anchorEl={userFilterAnchorEl}
                            onClose={handleCloseUserFilterMenu}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                        >
                            <List className="w-64 max-h-96 overflow-auto">
                                <ListItem
                                    button
                                    onClick={() => handleUserFilterClick('all')}
                                    selected={selectedUserFilter === 'all'}
                                    className="hover:bg-gray-100"
                                >
                                    <ListItemAvatar>
                                        <Avatar className="bg-blue-100 text-blue-600">
                                            <PersonIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary="All Users"
                                        secondary={`${tasks.length} tasks`}
                                        className="text-[#1976d2]"
                                    />
                                </ListItem>
                                <ListItem
                                    button
                                    onClick={() => handleUserFilterClick('unassigned')}
                                    selected={selectedUserFilter === 'unassigned'}
                                    className="hover:bg-gray-100"
                                >
                                    <ListItemAvatar>
                                        <Avatar className="bg-gray-100 text-gray-600">
                                            <PersonIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary="Unassigned"
                                        secondary={`${tasks.filter(t => !t.assigned_to).length} tasks`}
                                        className="text-[#1976d2]"
                                    />
                                </ListItem>
                                <Divider />
                                {users.map((user) => (
                                    <ListItem
                                        key={user._id}
                                        button
                                        onClick={() => handleUserFilterClick(user._id)}
                                        selected={selectedUserFilter === user._id}
                                        className="hover:bg-gray-100"
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                className="text-white"
                                                style={{ backgroundColor: getColorFromId(user._id) }}
                                            >
                                                {getInitials(user._id)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={user.name}
                                            secondary={`${userTaskCounts[user._id] || 0} tasks`}
                                            className="text-[#1976d2]"
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Popover>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpen}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Add Task
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {Object.entries(statusColumns).map(([status, columnName]) => (
                        <div key={status} className="border border-gray-200 rounded-lg p-2">
                            <div className="border border-gray-300 rounded-md bg-white shadow-sm h-12 flex items-center justify-center mb-4">
                                <h3 className="font-semibold text-gray-700 text-sm uppercase text-center">
                                    {columnName}
                                </h3>
                            </div>
                            {groupedTasks[status]?.map((task) => (
                                <Card
                                    key={task._id}
                                    className={`mb-2 cursor-pointer transition-shadow hover:shadow-md ${isTaskOverdue(task) ? 'border border-gray-300 border-l-4 border-red-500' : 'border border-gray-300'
                                        }`}
                                    onClick={() => handleEdit(task)}
                                >
                                    <CardContent className="p-3">
                                        <Chip
                                            label={taskTypes[task.type] || 'Task'}
                                            size="small"
                                            icon={
                                                task.type === 'bug' ? <BugReportIcon fontSize="small" className="text-black" /> :
                                                    task.type === 'user-story' ? <StoryIcon fontSize="small" className="text-black" /> :
                                                        task.type === 'epic' ? <EpicIcon fontSize="small" className="text-black" /> :
                                                            task.type === 'subtask' ? <SubtaskIcon fontSize="small" className="text-black" /> :
                                                                <TaskIcon fontSize="small" className="text-black" />
                                            }
                                            className={`mb-2 ${task.type === 'bug' ? 'bg-red-100' :
                                                task.type === 'user-story' ? 'bg-blue-100' :
                                                    task.type === 'epic' ? 'bg-purple-100' :
                                                        task.type === 'subtask' ? 'bg-gray-100' :
                                                            'bg-green-100'
                                                } text-black`}
                                        />
                                        <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                            {task.link ? (
                                                <a
                                                    href={task.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {task.title}
                                                </a>
                                            ) : (
                                                <p className="text-blue-600">{task.title}</p>
                                            )}
                                        </p>
                                        {task.tags && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {task.tags.split(',').map((tag, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={tag.trim()}
                                                        size="small"
                                                        className="bg-gray-200 text-gray-700 rounded text-xs"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardActions className="p-2">
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="flex justify-between items-center">
                                                <div className="flex space-x-1">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }}
                                                        className="text-gray-500 hover:text-red-500"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                    <Tooltip title="View Audit Logs">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => { e.stopPropagation(); handleAuditOpen(task._id); }}
                                                            className="text-gray-500 hover:text-blue-500"
                                                        >
                                                            <HistoryIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {task.priority && (
                                                        <Tooltip title={task.priority}>
                                                            {priorityMap[task.priority]?.icon || <CircleIcon className="text-gray-400" fontSize="small" />}
                                                        </Tooltip>
                                                    )}

                                                    {task.assigned_to && (
                                                        <Tooltip title={getTooltip(task.assigned_to)}>
                                                            <Avatar
                                                                className="w-8 h-8 text-xs"
                                                                style={{ backgroundColor: getColorFromId(task.assigned_to) }}
                                                            >
                                                                {getInitials(task.assigned_to)}
                                                            </Avatar>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </div>

                                            <StatusDropdown task={task} handleStatusChange={handleStatusChange} />
                                        </div>
                                    </CardActions>
                                </Card>
                            ))}
                        </div>
                    ))}
                </div>

                <Modal open={open} onClose={handleClose}>
                    <Box sx={style} className="rounded-xl bg-white p-6 shadow-xl w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                        <Typography variant="h6" component="div" className="font-bold text-xl mb-6">
                            {editingTask ? 'Edit Task' : 'Create Task'}
                        </Typography>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        {/* Task Type */}
                                        <FormControl fullWidth>
                                            <InputLabel id="type-label">Task Type</InputLabel>
                                            <Select
                                                labelId="type-label"
                                                id="type"
                                                name="type"
                                                value={taskData.type}
                                                label="Task Type"
                                                onChange={handleChange}
                                            >
                                                {Object.entries(taskTypes).map(([value, label]) => (
                                                    <MenuItem key={value} value={value}>{label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {/* Title */}
                                        <TextField
                                            label="Title"
                                            name="title"
                                            fullWidth
                                            value={taskData.title}
                                            onChange={handleChange}
                                        />

                                        {/* Description with AI button */}
                                        <div>
                                            <TextField
                                                label="Description"
                                                name="description"
                                                fullWidth
                                                multiline
                                                rows={10}
                                                value={taskData.description}
                                                onChange={handleChange}
                                            />
                                            <IconButton
                                                onClick={handleGenerateDescription}
                                                className="absolute bottom-9 right-1 text-blue-500 hover:text-blue-700"
                                                title="Write with AI"
                                            >
                                                <AutoAwesomeIcon />
                                            </IconButton>
                                        </div>

                                        {/* Due Date */}
                                        <DatePicker
                                            label="Due Date"
                                            value={taskData.dueDate ? dayjs(taskData.dueDate) : null}
                                            onChange={(newValue) => {
                                                setTaskData({
                                                    ...taskData,
                                                    dueDate: newValue ? newValue.format('YYYY-MM-DD') : ''
                                                });
                                            }}
                                            slotProps={{ textField: { fullWidth: true } }}
                                            sx={{ bottom: "30px" }}
                                        />

                                        {/* Priority */}
                                        <FormControl fullWidth>
                                            <InputLabel id="priority-label">Priority</InputLabel>
                                            <Select
                                                labelId="priority-label"
                                                id="priority"
                                                name="priority"
                                                value={taskData.priority}
                                                label="Priority"
                                                onChange={handleChange}
                                            >
                                                <MenuItem value="High">High</MenuItem>
                                                <MenuItem value="Medium">Medium</MenuItem>
                                                <MenuItem value="Low">Low</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Assigned To */}
                                        <FormControl fullWidth>
                                            <InputLabel id="assigned-to-label">Assigned To</InputLabel>
                                            <Select
                                                labelId="assigned-to-label"
                                                id="assigned_to"
                                                name="assigned_to"
                                                value={taskData.assigned_to}
                                                onChange={handleChange}
                                            >
                                                {users.length > 0 && users.map((item) => (
                                                    <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {/* Assigned By */}
                                        <FormControl fullWidth>
                                            <InputLabel id="assigned-by-label">Assigned By</InputLabel>
                                            <Select
                                                labelId="assigned-by-label"
                                                id="assigned_by"
                                                name="assigned_by"
                                                value={taskData.assigned_by}
                                                onChange={handleChange}
                                            >
                                                {users.length > 0 && users.map((item) => (
                                                    <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {/* Link */}
                                        <TextField
                                            label="Resource Link"
                                            name="link"
                                            fullWidth
                                            value={taskData.link || 'https://'}
                                            onChange={handleChange}
                                        />

                                        {/* Tags */}
                                        <TextField
                                            label="Tags (comma separated)"
                                            name="tags"
                                            fullWidth
                                            value={taskData.tags}
                                            onChange={handleChange}
                                        />

                                        {/* Status */}
                                        <FormControl fullWidth>
                                            <InputLabel id="status-label">Status</InputLabel>
                                            <Select
                                                labelId="status-label"
                                                id="status"
                                                name="status"
                                                value={taskData.status || 1}
                                                onChange={handleChange}
                                            >
                                                {Object.entries(statusColumns).map(([val, name]) => (
                                                    <MenuItem key={val} value={val}>{name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {/* Visibility */}
                                        <FormControl fullWidth>
                                            <InputLabel id="visibility-label">Visibility</InputLabel>
                                            <Select
                                                labelId="visibility-label"
                                                id="visibility"
                                                name="visibility"
                                                value={taskData.visibility}
                                                onChange={handleChange}
                                            >
                                                <MenuItem value="private">Private</MenuItem>
                                                <MenuItem value="group">Group</MenuItem>
                                                <MenuItem value="public">Public</MenuItem>
                                            </Select>
                                        </FormControl>

                                        {/* Group Dropdown - Only show if visibility is "group" */}
                                        {taskData.visibility === 'group' && (
                                            <FormControl fullWidth>
                                                <InputLabel id="group-label">Group</InputLabel>
                                                <Select
                                                    labelId="group-label"
                                                    id="group"
                                                    name="group"
                                                    value={taskData.group || ''}
                                                    onChange={handleChange}
                                                >
                                                    {groups.length > 0 && groups.map((group) => (
                                                        <MenuItem key={group._id} value={group._id}>{group.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    </div>
                                </div>

                                {/* Linked Tasks */}
                                <div className="pt-6 border-t">
                                    <div className="flex items-center justify-between mb-2">
                                        <Typography variant="subtitle2" className="font-semibold">Linked Tasks</Typography>
                                        <IconButton
                                            onClick={() => {
                                                fetchAvailableTasks(editingTask?._id);
                                                setLinkModalOpen(true);
                                            }}
                                            className="text-blue-500 hover:text-blue-700"
                                            title="Link Task"
                                        >
                                            <AddLinkIcon fontSize="small" />
                                        </IconButton>
                                    </div>

                                    {taskData.linkedTasks?.length ? (
                                        <List className="border border-gray-200 rounded-md max-h-36 overflow-auto">
                                            {taskData.linkedTasks.map(linkedTaskId => {
                                                const linkedTask = tasks.find(t => t._id === linkedTaskId);
                                                if (!linkedTask) return null;

                                                return (
                                                    <ListItem
                                                        key={linkedTaskId}
                                                        secondaryAction={
                                                            <IconButton
                                                                edge="end"
                                                                onClick={() => {
                                                                    setTaskData(prev => ({
                                                                        ...prev,
                                                                        linkedTasks: prev.linkedTasks.filter(id => id !== linkedTaskId),
                                                                    }));
                                                                }}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        }
                                                        className="py-1 hover:bg-gray-50"
                                                    >
                                                        <ListItemText
                                                            primary={linkedTask.title}
                                                            secondary={`Status: ${statusColumns[linkedTask.status]}`}
                                                            className="text-sm"
                                                        />
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" className="text-gray-500 italic">
                                            No tasks linked
                                        </Typography>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4 text-right">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow"
                                    >
                                        {editingTask ? 'Update Task' : 'Create Task'}
                                    </Button>
                                </div>
                            </form>
                        </LocalizationProvider>
                    </Box>
                </Modal>

                <Modal open={auditOpen} onClose={handleAuditClose}>
                    <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-xl p-6 rounded-lg overflow-y-auto">
                        <Typography variant="h6" component="div" className="font-bold text-xl mb-4 text-gray-900 dark:text-gray-100">
                            Audit Logs
                        </Typography>
                        <List>
                            {auditLogs.length === 0 ? (
                                <Typography className="text-gray-500 dark:text-gray-400">No audit logs found</Typography>
                            ) : (
                                auditLogs.map((log) => (
                                    <ListItem key={log._id} className="py-2">
                                        <ListItemAvatar>
                                            <Avatar style={{ backgroundColor: getColorFromId(log.changedBy?._id || '') }}>
                                                {log.changedBy?.name ? log.changedBy.name.charAt(0).toUpperCase() : '?'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {log.action.toUpperCase()} - {dayjs(log.timestamp).format('MMM D, YYYY h:mm A')}
                                                </span>
                                            }
                                            secondary={
                                                <>
                                                    <span className="block text-gray-600 dark:text-gray-400">
                                                        Changed by: {log.changedBy?.name || 'Unknown'}
                                                    </span>
                                                    {Object.entries(log.changes || {}).map(([key, value]) => {
                                                        if (key === 'status') {
                                                            value = statusColumns[value];
                                                        }
                                                        if (key === "assigned_by" || key === "assigned_to") {
                                                            const user = users.find((user) => user._id === value);
                                                            value = user?.name || value;
                                                        }
                                                        return (
                                                            <span key={key} className="block text-sm text-gray-600 dark:text-gray-400">
                                                                {key}: {JSON.stringify(value)}
                                                            </span>
                                                        );
                                                    })}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Box>
                </Modal>
                <Modal open={linkModalOpen} onClose={() => setLinkModalOpen(false)}>
                    <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-xl p-6 rounded-lg overflow-y-auto">
                        <Typography variant="h6" className="font-bold text-xl mb-4 text-gray-900 dark:text-gray-100">
                            Link Tasks
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-4">
                            Select tasks to link with: <span className="text-gray-900 dark:text-gray-100">{taskData.title}</span>
                        </Typography>

                        <div className="max-h-72 overflow-auto mb-4">
                            {availableTasks.length === 0 ? (
                                <Typography className="text-gray-500 dark:text-gray-400">No tasks available to link</Typography>
                            ) : (
                                <List>
                                    {availableTasks.map(task => (
                                        <ListItem
                                            key={task._id}
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => {
                                                        if (selectedTasksToLink.includes(task._id)) {
                                                            setSelectedTasksToLink(selectedTasksToLink.filter(id => id !== task._id));
                                                        } else {
                                                            setSelectedTasksToLink([...selectedTasksToLink, task._id]);
                                                        }
                                                    }}
                                                    className={selectedTasksToLink.includes(task._id) ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}
                                                >
                                                    {selectedTasksToLink.includes(task._id) ? (
                                                        <LinkIcon className="text-gray-900 dark:text-gray-100" />
                                                    ) : (
                                                        <AddLinkIcon className="text-gray-900 dark:text-gray-100" />
                                                    )}
                                                </IconButton>
                                            }
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <ListItemText
                                                primary={<span className="text-gray-900 dark:text-gray-100">{task.title}</span>}
                                                secondary={<span className="text-gray-600 dark:text-gray-400">Status: {statusColumns[task.status]}</span>}
                                                className="text-sm"
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                            <Button
                                onClick={() => setLinkModalOpen(false)}
                                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleLinkTasks}
                                disabled={selectedTasksToLink.length === 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Link Tasks
                            </Button>
                        </div>
                    </Box>
                </Modal>
            </Container>
        </>
    );
}

export default Task;