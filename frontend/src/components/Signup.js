/**
 * @fileoverview Signup component for user registration.
 * Allows new users to create an account by providing their name, email, and password.
 * @module Signup
 * @requires react
 * @requires @mui/material
 * @requires @mui/icons-material
 * @requires axios
 * @requires react-toastify
 * @requires react-router-dom
 * @requires ../config
 */

import React, { useState } from 'react';
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    Link,
    Grid,
    Box,
    Typography,
    Container,
    Paper,
    Fade,
    InputAdornment,
    IconButton,
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config';
import { useNavigate } from 'react-router-dom';

/**
 * Signup component - Renders a form for user registration.
 * @function Signup
 * @returns {JSX.Element} The rendered Signup component.
 */
export default function Signup() {
    const navigate = useNavigate(); // Hook for navigation.
    const [formData, setFormData] = useState({
        name: '', // State for the user's full name.
        username: '', // State for the user's email.
        password: '', // State for the user's password.
    });
    const [showPassword, setShowPassword] = useState(false); // State for password visibility.

    /**
     * Handles input field changes and updates the form data state.
     * @function handleChange
     * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
     */
    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    /**
     * Toggles the visibility of the password field.
     * @function handleTogglePasswordVisibility
     */
    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    /**
     * Handles form submission for user registration.
     * Validates the input and sends a request to the server to create a new account.
     * @async
     * @function handleSubmit
     * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
     * @returns {Promise<void>}
     */
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!formData.name || !formData.username || !formData.password) {
            toast.error("Please fill in all fields");
            return;
        }
        try {
            const response = await axios.post(`${config.apiUrl}/api/users/signup`, formData, {
                withCredentials: true
            });
            if (response.status === 201) {
                sessionStorage.setItem('userId', response.data.userId);
                toast.success("Signup successful");
                navigate("/login");
            }
        } catch (error) {
            console.error(error);
            toast.error("Signup failed");
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: (theme) => theme.palette.background.default,
                }}
            >
                <Fade in timeout={500}>
                    <Paper
                        elevation={10}
                        sx={{
                            p: 4,
                            borderRadius: 4,
                            width: '100%',
                            backdropFilter: 'blur(10px)',
                            background: (theme) =>
                                theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
                            boxShadow: 8,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Avatar
                                sx={{
                                    m: 1,
                                    bgcolor: 'primary.main',
                                    transition: '0.3s',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                    },
                                }}
                            >
                                <PersonAddAlt1Icon />
                            </Avatar>
                            <Typography component="h1" variant="h5" fontWeight="bold">
                                Sign Up
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Full Name"
                                    name="name"
                                    autoFocus
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Email"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleTogglePasswordVisibility}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        mt: 3,
                                        mb: 2,
                                        py: 1.2,
                                        fontWeight: 600,
                                        letterSpacing: 1,
                                    }}
                                >
                                    Create Account
                                </Button>
                                <Grid container justifyContent="center">
                                    <Grid item>
                                        <Link href="/login" variant="body2" underline="hover">
                                            Already have an account? Sign In
                                        </Link>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>
            </Box>
        </Container>
    );
}