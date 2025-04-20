/**
 * @fileoverview Login component for user authentication.
 * @module Login
 * @requires react
 * @requires @mui/material
 * @requires @mui/icons-material
 * @requires axios
 * @requires react-toastify
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
    Divider,
    Fade,
    InputAdornment,
    IconButton,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config';

/**
 * Login component - Renders a login form for user authentication.
 * @function Login
 * @returns {JSX.Element} The rendered login form.
 */
export default function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

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
     * Handles form submission for user login.
     * @async
     * @function handleSubmit
     * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
     * @returns {Promise<void>}
     */
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!formData.username || !formData.password) {
            toast.error("Please fill in all fields");
            return;
        }
        try {
            const response = await axios.post(`${config.apiUrl}/api/users/login`, formData);
            if (response.data.token) {
                sessionStorage.setItem('userId', response.data.userId);
                sessionStorage.setItem('userName', response.data.userName);
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            toast.error("Login failed");
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
                                <LockOutlinedIcon />
                            </Avatar>
                            <Typography component="h1" variant="h5" fontWeight="bold">
                                Sign in
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    autoFocus
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
                                    Sign In
                                </Button>
                                <Divider sx={{ my: 2 }} />
                                <Grid container direction="column" spacing={1}>
                                    <Grid item>
                                        <Link href="/forgot-password" variant="body2" underline="hover">
                                            Forgot your password?
                                        </Link>
                                    </Grid>
                                    <Grid item>
                                        <Link href="/signup" variant="body2" underline="hover">
                                            Don’t have an account? Sign Up
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