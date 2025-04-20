/**
 * @fileoverview React component for handling password reset requests
 * @module ForgotPassword
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
    Fade
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config';

/**
 * ForgotPassword component - Allows users to request a password reset link
 * @function ForgotPassword
 * @returns {JSX.Element} The rendered forgot password form
 */
const ForgotPassword = () => {
    const [email, setEmail] = useState('');

    /**
     * Handles form submission for password reset request
     * @async
     * @function handleSubmit
     * @param {React.FormEvent} e - Form submission event
     * @returns {Promise<void>}
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email");
            return;
        }
        try {
            const response = await axios.post(`${config.apiUrl}/api/users/forgot-password`, { email: email });

            if (response.status === 200) {
                toast.success("Password reset email sent");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to send reset email");
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
                                <LockResetIcon />
                            </Avatar>
                            <Typography component="h1" variant="h5" fontWeight="bold">
                                Forgot Password
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                                Enter your email address and we'll send you a link to reset your password.
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        mt: 2,
                                        mb: 2,
                                        py: 1.2,
                                        fontWeight: 600,
                                        letterSpacing: 1,
                                    }}
                                >
                                    Send Reset Link
                                </Button>
                                <Grid container justifyContent="center">
                                    <Grid item>
                                        <Link href="/login" variant="body2" underline="hover">
                                            Back to Login
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
};

export default ForgotPassword;