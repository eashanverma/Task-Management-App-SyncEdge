/**
 * @fileoverview Task Management API server using Express.js and MongoDB
 * @module server
 * @requires express
 * @requires mongoose
 * @requires cors
 * @requires bcryptjs
 * @requires jsonwebtoken
 * @requires nodemailer
 * @requires cookie-parser
 * @requires axios
 * @requires dotenv
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const cookieParser = require('cookie-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
// app.use(cors({
//     origin: 'http://localhost:3000', //Development
//     credentials: true,
// }));
app.use(cors({
    origin: 'https://syncedge.vercel.app', // Production origin
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const crypto = require('crypto');


/**
 * MongoDB connection setup
 * @name connectToMongoDB
 * @function
 * @throws {Error} If connection to MongoDB fails
 */
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

/**
 * Mongoose User Schema
 * @typedef {Object} UserSchema
 * @property {string} name - User's full name
 * @property {string} username - User's unique username (email)
 * @property {string} password - Hashed password
 * @property {string} [resetToken] - Password reset token
 * @property {Date} [resetTokenExpiration] - Password reset token expiration
 */
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: String,
    resetTokenExpiration: Date,
});

/**
 * Mongoose Task Schema
 * @typedef {Object} TaskSchema
 * @property {string} title - Task title
 * @property {string} [description] - Task description
 * @property {string} [link] - Related resource link
 * @property {string} [tags] - Comma-separated tags
 * @property {string} visibility - Task visibility ('private', 'group', 'public')
 * @property {boolean} completed - Task completion status
 * @property {number} status - Task status (1-6)
 * @property {mongoose.Schema.Types.ObjectId} group - Associated group ID
 * @property {mongoose.Schema.Types.ObjectId} owner - Task owner's user ID
 * @property {string} assigned_by - Name of assigner
 * @property {string} assigned_to - Name of assignee
 * @property {string} priority - Task priority
 * @property {string} dueDate - Due date of task
 * @property {string} type - Task type
 * @property {Array.<mongoose.Schema.Types.ObjectId>} linkedTasks - Array of linked task IDs
 */
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    link: { type: String },
    tags: { type: String },
    visibility: { type: String, enum: ['private', 'group', 'public'], default: 'private' },
    completed: { type: Boolean, default: false },
    status: { type: Number, default: 1 },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // Optional by default
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assigned_by: { type: String },
    assigned_to: { type: String },
    priority: { type: String },
    dueDate: { type: String },
    type: { type: String },
    linkedTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }]
});

/**
 * Mongoose Task Schema
 * @typedef {Object} TaskSchema
 * @property {string} title - Task title
 * @property {string} [description] - Task description
 * @property {string} [link] - Related resource link
 * @property {string} [tags] - Comma-separated tags
 * @property {string} visibility - Task visibility ('private', 'group', 'public')
 * @property {boolean} completed - Task completion status
 * @property {number} status - Task status (1-6)
 * @property {mongoose.Schema.Types.ObjectId} group - Associated group ID
 * @property {mongoose.Schema.Types.ObjectId} owner - Task owner's user ID
 * @property {string} assigned_by - Name of assigner
 * @property {string} assigned_to - Name of assignee
 * @property {string} priority - Task priority
 * @property {string} dueDate - Due date of task
 * @property {string} type - Task type
 * @property {Array.<mongoose.Schema.Types.ObjectId>} linkedTasks - Array of linked task IDs
 */
const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

/**
 * Mongoose Audit Schema
 * @typedef {Object} AuditSchema
 * @property {mongoose.Schema.Types.ObjectId} taskId - Associated task ID
 * @property {string} action - Audit action ('create', 'update', 'delete')
 * @property {mongoose.Schema.Types.ObjectId} changedBy - User ID who made changes
 * @property {Object} changes - Object containing changed fields
 * @property {Date} timestamp - Timestamp of audit record
 */
const auditSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    action: { type: String, required: true }, // 'create', 'update', 'delete'
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    changes: { type: Object }, // Will store the changed fields
    timestamp: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    message: { type: String, required: true },
    type: { type: String, enum: ['assignment', 'update', 'deleted'], required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    metadata: { type: Object }
});

// Mongoose Models
const Audit = mongoose.model('Audit', auditSchema);
const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);
const Group = mongoose.model('Group', groupSchema);
const Notification = mongoose.model('Notification', notificationSchema);

// API Routes

/**
 * POST /api/users/forgot-password - Initiates password reset process
 * @name postForgotPassword
 * @function
 * @param {Object} req - Express request object
 * @param {string} req.body.email - User's email address
 * @param {Object} res - Express response object
 * @returns {Object} Response with success message or error
 */
app.post("/api/users/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ username: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            html: `
                <p>You are receiving this email because you (or someone else) has requested the reset of the password for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <a href="${process.env.FRONTEND_URL}/reset-password/${token}">${process.env.FRONTEND_URL}/reset-password/${token}</a>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("Error sending password reset email:", error);
        res.status(500).json({ message: "Failed to send reset email" });
    }
});

/**
 * POST /api/users/reset-password - Resets user password using token
 * @name postResetPassword
 * @function
 * @param {Object} req - Express request object
 * @param {string} req.body.token - Password reset token
 * @param {string} req.body.password - New password
 * @param {Object} res - Express response object
 * @returns {Object} Response with success message or error
 */
app.post('/api/users/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/users/signup - Creates a new user account
 * @name postSignup
 * @function
 * @param {Object} req - Express request object
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.username - User's email/username
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Object} Response with JWT token and user ID or error
 */
app.post('/api/users/signup', async (req, res) => {
    try {
        const { name, username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, username, password: hashedPassword });
        await newUser.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: username,
            subject: 'Welcome to Task Management App By Group X',
            text: `Welcome, ${name}! Your account has been created successfully.`,
        };

        await transporter.sendMail(mailOptions);
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);
        res.status(201).json({ token, userId: newUser._id });
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/users/login - Authenticates user and returns JWT token
 * @name postLogin
 * @function
 * @param {Object} req - Express request object
 * @param {string} req.body.username - User's email/username
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Object} Response with JWT token, user ID, and name or error
 */
app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('jwt', token, {
            httpOnly: false,
            secure: true,
            sameSite: 'none',
            maxAge: 3600000
        });
        res.json({ token, userId: user._id, userName: user.name });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/users/verify - Verifies JWT token validity
 * @name getVerify
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with verification status or error
 */
app.get('/api/users/verify', (req, res) => {
    try {
        //console.log('Cookies:', req);
        const token = req.cookies.jwt;
        //console.log('Token:', token);
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        //console.log("Decoded Token", decodedToken);
        User.findById(decodedToken.userId)
            .then(user => {
                if (!user) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                res.json({ message: 'JWT is valid', userId: decodedToken.userId });
            })
            .catch(error => {
                console.error('Error finding user:', error);
                res.status(500).json({ message: 'Server error' });
            });
    } catch (error) {
        console.error('Error verifying JWT:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
});

/**
 * GET /api/users/logout - Logs out user by clearing JWT cookie
 * @name getLogout
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success message or error
 */
app.get('/api/users/logout', (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.cookie('jwt', '', {
            expires: new Date(0),
            httpOnly: false,
            secure: true,
            sameSite: 'none'
        });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Authentication middleware to verify JWT token
 * @name authMiddleware
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {Object} 401 Unauthorized error if token is invalid
 */
const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decodedToken.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

/**
 * PUT /api/users/:id - Updates user profile
 * @name putUser
 * @function
 * @param {Object} req - Express request object
 * @param {string} req.params.id - User ID to update
 * @param {string} req.body.name - Updated name
 * @param {string} req.body.username - Updated username
 * @param {Object} res - Express response object
 * @returns {Object} Updated user object or error
 */
app.put('/api/users/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, username } = req.body;

        // Find the user and check if the authenticated user is the same user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user._id.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own profile' });
        }

        // Update the user
        user.name = name;
        user.username = username;
        const updatedUser = await user.save();

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

/**
 * GET /api/users - Gets all users (name and username only)
 * @name getUsers
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array.<Object>} Array of user objects or error
 */
app.get('/api/users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({}, { username: 1, name: 1 });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

/**
 * GET /api/tasks - Gets all tasks visible to the authenticated user
 * @name getTasks
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array.<Object>} Array of task objects or error
 */
app.get('/api/tasks', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;

        let tasks;
        tasks = await Task.find({
            $or: [
                { owner: userId }, // User's own tasks
                { assigned_by: userId }, // Tasks assigned by the user
                { assigned_to: userId }, // Tasks assigned to the user
                { visibility: 'public' }, // All public tasks
                { visibility: 'group', group: { $in: await Group.find({ members: userId }).distinct('_id') } }, // Group tasks where the user is a member
            ],
        });

        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
});

/**
 * POST /api/tasks - Creates a new task
 * @name postTask
 * @function
 * @param {Object} req - Express request object
 * @param {Object} req.body - Task data
 * @param {Object} res - Express response object
 * @returns {Object} Created task object or error
 */
app.post('/api/tasks', authMiddleware, async (req, res) => {
    try {
        const { title, description, link, tags, visibility, group, assigned_by, assigned_to, priority, dueDate, type, linkedTasks, status } = req.body;

        const newTask = new Task({
            title,
            description,
            link,
            tags,
            visibility,
            owner: req.userId,
            status,
            assigned_by,
            assigned_to,
            priority,
            dueDate,
            type,
            linkedTasks,
            ...(group && { group }) // Only include `group` if it is provided
        });

        const savedTask = await newTask.save();
        await recordAudit(savedTask._id, 'create', req.userId, savedTask.toObject());

        const usersToNotify = await getUsersToNotify(savedTask);
        await sendNotifications(usersToNotify, savedTask, 'assignment', req.userId);

        res.status(201).json(savedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Failed to create task' });
    }
});

const { ObjectId } = require('mongodb');

/**
 * Helper function to get user name by ID
 * @name getNameById
 * @function
 * @param {Array.<Object>} users - Array of user objects
 * @param {string} userid - User ID to find
 * @returns {string} User's name or undefined if not found
 */
function getNameById(users, userid) {
    const userIdObj = new ObjectId(userid);
    const user = users.find((item) => item._id.equals(userIdObj));
    return user.name;
}

/**
 * Helper function to get username by ID
 * @name getUsernameById
 * @function
 * @param {Array.<Object>} users - Array of user objects
 * @param {string} userid - User ID to find
 * @returns {string} User's username or null if not found
 */
function getUsernameById(users, userid) {
    const userIdObj = new ObjectId(userid);
    const user = users.find((item) => item._id.equals(userIdObj));
    return user ? user.username : null;
}

/**
 * PUT /api/tasks/:id - Updates an existing task
 * @name putTask
 * @function
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Task ID to update
 * @param {Object} req.body - Updated task data
 * @param {Object} res - Express response object
 * @returns {Object} Updated task object or error
 */
app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const {
            title,
            description,
            link,
            tags,
            visibility,
            completed,
            status,
            group,
            assigned_by,
            assigned_to,
            priority,
            dueDate,
            type,
            linkedTasks
        } = req.body;

        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id },
            {
                title,
                description,
                link,
                tags,
                visibility,
                completed,
                status,
                assigned_by,
                assigned_to,
                priority,
                dueDate,
                type,
                linkedTasks,
                ...(group && { group }) // Only update `group` if it is provided
            },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const changes = {};
        const oldTask = await Task.findById(req.params.id);
        if (oldTask.title !== updatedTask.title) changes.title = updatedTask.title;
        if (oldTask.group?.toString() !== updatedTask.group?.toString()) changes.group = updatedTask.group;

        await recordAudit(updatedTask._id, 'update', req.userId, changes);

        const usersToNotify = await getUsersToNotify(updatedTask);
        await sendNotifications(usersToNotify, updatedTask, 'update', req.userId);

        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Failed to update task' });
    }
});

/**
 * Helper function to compare arrays
 * @name arraysEqual
 * @function
 * @param {Array} arr1 - First array
 * @param {Array} arr2 - Second array
 * @returns {boolean} True if arrays are equal, false otherwise
 */
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value, index) => value.toString() === arr2[index].toString());
}

/**
 * DELETE /api/tasks/:id - Deletes a task
 * @name deleteTask
 * @function
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Task ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} Success message or error
 */
app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const taskToDelete = await Task.findById(req.params.id);
        if (!taskToDelete) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await recordAudit(taskToDelete._id, 'delete', req.userId, {
            title: taskToDelete.title,
            description: taskToDelete.description,
            link: taskToDelete.link,
            tags: taskToDelete.tags,
            visibility: taskToDelete.visibility,
            completed: taskToDelete.completed,
            status: taskToDelete.status,
            group: taskToDelete.group,
            owner: taskToDelete.owner,
            assigned_by: taskToDelete.assigned_by,
            assigned_to: taskToDelete.assigned_to,
            priority: taskToDelete.priority,
            dueDate: taskToDelete.dueDate,
            linkedTasks: taskToDelete.linkedTasks
        });

        const deletedTask = await Task.findOneAndDelete({ _id: req.params.id });
        const usersToNotify = await getUsersToNotify(taskToDelete);


        await sendNotifications(
            usersToNotify,
            taskToDelete,
            'deleted',
            req.userId
        );
        res.json({ message: 'Task deleted' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Failed to delete task' });
    }
});

/**
 * GET /api/groups - Gets all groups
 * @name getGroups
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array.<Object>} Array of group objects or error
 */
app.get('/api/groups', authMiddleware, async (req, res) => {
    try {
        //const groups = await Group.find({ $or: [{ owner: req.userId }, { members: req.userId }] });
        const groups = await Group.find({});
        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Failed to fetch groups' });
    }
});

/**
 * POST /api/groups - Creates a new group
 * @name postGroup
 * @function
 * @param {Object} req - Express request object
 * @param {string} req.body.name - Group name
 * @param {Array.<string>} req.body.members - Array of member user IDs
 * @param {Object} res - Express response object
 * @returns {Object} Created group object or error
 */
app.post('/api/groups', authMiddleware, async (req, res) => {
    try {
        const { name, members } = req.body;
        const newGroup = new Group({ name, owner: req.userId, members: members });
        const savedGroup = await newGroup.save();
        res.status(201).json(savedGroup);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Failed to create group' });
    }
});

/**
 * PUT /api/groups/:id - Updates an existing group
 * @name putGroup
 * @function
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Group ID to update
 * @param {Object} req.body - Updated group data
 * @param {Object} res - Express response object
 * @returns {Object} Updated group object or error
 */
app.put('/api/groups/:id', authMiddleware, async (req, res) => {
    try {
        const groupId = req.params.id;
        const { name, members, owner } = req.body;

        // Find the group and check if the user is the owner
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (group.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden: Only the owner can update the group' });
        }

        // Update the group
        group.name = name;
        group.members = members;
        group.owner = owner;
        const updatedGroup = await group.save();

        res.json(updatedGroup);
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ message: 'Failed to update group' });
    }
});

/**
 * DELETE /api/groups/:id - Deletes a group
 * @name deleteGroup
 * @function
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Group ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} Success message or error
 */
app.delete('/api/groups/:id', authMiddleware, async (req, res) => {
    try {
        const groupId = req.params.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (group.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden: Only the owner can delete the group' });
        }

        // Delete the group
        await Group.findByIdAndDelete(groupId);

        await Task.deleteMany({ group: groupId });

        res.json({ message: 'Group deleted' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ message: 'Failed to delete group' });
    }
});

/**
 * GET /api/tasks/:id/audit - Gets audit logs for a specific task
 * @name getTaskAudit
 * @function
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Task ID to get audit logs for
 * @param {Object} res - Express response object
 * @returns {Array.<Object>} Array of audit log objects or error
 */
app.get('/api/tasks/:id/audit', authMiddleware, async (req, res) => {
    try {
        const taskId = req.params.id;

        // Verify the task exists and user has permission
        const task = await Task.findOne({
            _id: taskId
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or access denied' });
        }

        const auditLogs = await Audit.find({ taskId })
            .populate('changedBy', 'name')
            .sort({ timestamp: -1 });

        res.json(auditLogs);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
});

/**
 * Records an audit log for task changes
 * @name recordAudit
 * @function
 * @async
 * @param {string} taskId - Task ID being audited
 * @param {string} action - Audit action ('create', 'update', 'delete')
 * @param {string} changedBy - User ID who made changes
 * @param {Object} [changes={}] - Object containing changed fields
 * @returns {Promise<void>}
 */
async function recordAudit(taskId, action, changedBy, changes = {}) {
    try {
        const auditLog = new Audit({
            taskId,
            action,
            changedBy,
            changes
        });
        await auditLog.save();
    } catch (error) {
        console.error('Error recording audit log:', error);
    }
}

/**
 * POST /api/generate-description - Generates task description using GEMINI AI
 * @name postGenerateDescription
 * @function
 * @param {Object} req - Express request object
 * @param {Object} req.body - Task data to generate description from
 * @param {Object} res - Express response object
 * @returns {Object} Generated description or error
 */
app.post('/api/generate-description', async (req, res) => {
    try {
        const { assignedToName, title, tags, assignedByName, resource_link, status, group, priority, due_date } = req.body;

        let prompt = `Generate a paragraph without any headlines with more detials with limit of 200 words task description similar to JIRA for the following task items: `;

        if (assignedToName) {
            prompt += `Assigned To: ${assignedToName}. `;
        }
        if (assignedByName) {
            prompt += `Assigned By: ${assignedByName}. `;
        }
        if (title) {
            prompt += `Title: ${title}. `;
        }
        if (tags) {
            prompt += `comma_seprated_tags: ${tags}. `;
        }
        if (resource_link) {
            prompt += `Resource_link: ${resource_link}. `;
        }
        const statusColumns = {
            1: 'Requirement Gathering',
            2: 'In Dev',
            3: 'Dev Completed',
            4: 'In Testing',
            5: 'Testing Done',
            6: 'Done',
        };
        if (status) {
            prompt += `status: ${statusColumns[status]}. `;
        }
        if (priority) {
            prompt += `priority: ${priority}. `;
        }
        if (due_date) {
            prompt += `due_date: ${due_date}. `;
        }

        const geminiPayload = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };

        const geminiResponse = await axios.post(
            `${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
            geminiPayload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (geminiResponse.data && geminiResponse.data.candidates && geminiResponse.data.candidates.length > 0 && geminiResponse.data.candidates[0].content && geminiResponse.data.candidates[0].content.parts && geminiResponse.data.candidates[0].content.parts.length > 0) {
            const generatedDescription = geminiResponse.data.candidates[0].content.parts[0].text.trim();
            res.json({ description: generatedDescription });
        } else {
            console.error('Gemini API response structure unexpected:', geminiResponse.data);
            res.status(500).json({ error: 'Failed to generate description from AI' });
        }

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Failed to generate description from AI' });
    }
});

//Helper to send notifications to multiple users
async function sendNotifications(userIds, task, type, actorId) {
    const actor = await User.findById(actorId);
    const actorName = actor ? actor.name : 'Someone';

    let message = '';
    const taskTitle = task.title || 'a task';

    if (type === 'assignment') {
        const assignee = await User.findById(task.assigned_to);
        const assigneeName = assignee ? assignee.name : 'someone';
        message = `${actorName} created a task "${taskTitle}" for ${assigneeName}.`;
    } else if (type === 'update') {
        message = `${actorName} updated the task "${taskTitle}".`;
    } else if (type === 'deleted') {
        message = `${actorName} deleted the task "${taskTitle}".`;
    }

    const notifications = userIds.map(userId => ({
        userId,
        taskId: task._id,
        message,
        type,
    }));
    await Notification.insertMany(notifications);
}

//Determine which users to notify based on task info
async function getUsersToNotify(task) {
    try {
        const users = new Set();

        if (task.assigned_to) users.add(new mongoose.Types.ObjectId(task.assigned_to));

        if (
            task.owner &&
            task.assigned_to &&
            task.owner.toString() !== task.assigned_to
        ) {
            users.add(task.owner);
        }

        if (task.visibility === 'group' && task.group) {
            const group = await Group.findById(task.group).populate('members');
            group.members.forEach(member => users.add(member._id));
        }
        return Array.from(users);
    } catch (error) {
        console.error('Error determining users to notify:', error);
        return [];
    }
}

//Get all notifications for logged-in user
app.get('/api/notifications', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(30);
        res.json(notifications);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ error: 'Failed to load notifications' });
    }
});

//Mark one notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

//Mark all notifications as read
app.put('/api/notifications/mark-all-read', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        await Notification.updateMany({ userId, read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));