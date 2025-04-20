/**
 * @fileoverview ResetPassword component for handling password reset functionality.
 * Allows users to reset their password using a token sent to their email.
 * @module ResetPassword
 * @requires react
 * @requires axios
 * @requires react-toastify
 * @requires @mui/material
 * @requires react-router-dom
 * @requires ../config
 * @requires ./../assets/images.png
 */

import React, { useState } from "react";
import axios from "axios";
import config from "../config";
import { toast } from "react-toastify";
import {
    Button,
    TextField,
    Typography,
    Container,
    Box,
    CssBaseline,
    Alert,
    InputAdornment,
    IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import image from './../assets/images.png';
import { useParams } from "react-router-dom";

/**
 * ResetPassword component - Renders a form for users to reset their password.
 * @function ResetPassword
 * @returns {JSX.Element} The rendered ResetPassword component.
 */
function ResetPassword() {
    const { token } = useParams(); // Extracts the token from the URL parameters.
    const [password, setPassword] = useState(""); // State for the new password.
    const [confirmPassword, setConfirmPassword] = useState(""); // State for confirming the new password.
    const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility.
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for toggling confirm password visibility.
    const [error, setError] = useState(""); // State for error messages.
    const [isSuccess, setIsSuccess] = useState(false); // State to track if the password reset was successful.

    /**
     * Toggles the visibility of the password field.
     * @function handleTogglePasswordVisibility
     */
    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    /**
     * Toggles the visibility of the confirm password field.
     * @function handleToggleConfirmPasswordVisibility
     */
    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prev) => !prev);
    };

    /**
     * Handles the form submission for resetting the password.
     * Validates the input and sends a request to the server to reset the password.
     * @async
     * @function handleSubmit
     * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
     * @returns {Promise<void>}
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate that the passwords match.
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            // Send a POST request to reset the password.
            await axios.post(
                `${config.apiUrl}/api/users/reset-password`,
                { token, password }
            );
            toast.success("Password reset successfully!");
            setIsSuccess(true);
            setError("");
        } catch (error) {
            console.error("Error resetting password:", error);
            setError(error.response?.data?.message || "Failed to reset password");
            toast.error("Failed to reset password.");
        }
    };

    // Render a success message if the password reset was successful.
    if (isSuccess) {
        return (
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <img src={image} alt="SYNC EDGE Logo" style={{ width: '150px', height: 'auto' }} />
                    <Typography component="h1" variant="h5">
                        Password Reset Successful
                    </Typography>
                    <Alert severity="success" sx={{ mt: 3 }}>
                        Your password has been reset successfully. You can now log in with your new password.
                    </Alert>
                    <Button
                        href="/login"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Go to Login
                    </Button>
                </Box>
            </Container>
        );
    }

    // Render the password reset form.
    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Typography component="h1" variant="h5">
                    Reset Password
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm New Password"
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleToggleConfirmPasswordVisibility}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Reset Password
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default ResetPassword;