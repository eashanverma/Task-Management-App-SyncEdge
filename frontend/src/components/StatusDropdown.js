import React, { useState } from 'react';
import { Button, Menu, MenuItem, Box } from '@mui/material';
import { statusColumns } from './Task'; // Replace with your status mapping

function StatusDropdown({ task, handleStatusChange }) {
    const [anchorEl, setAnchorEl] = useState(null); // State for the dropdown menu

    // Open the dropdown menu
    const handleClick = (event) => {
        event.stopPropagation(); // Prevent card click event
        setAnchorEl(event.currentTarget);
    };

    // Close the dropdown menu
    const handleClose = () => {
        setAnchorEl(null);
    };

    // Handle status selection
    const handleSelect = (statusValue) => {
        handleStatusChange(task._id, statusValue); // Update the status
        handleClose(); // Close the dropdown
    };

    return (
        <Box>
            {/* Button to display the current status */}
            <Button
                variant="outlined"
                onClick={handleClick}
                sx={{
                    textTransform: 'none', // Prevent uppercase
                    width: '100%', // Full width
                    justifyContent: 'flex-start', // Align text to the left
                }}
            >
                {statusColumns[task.status]} {/* Display the current status */}
            </Button>

            {/* Dropdown menu for status options */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {Object.entries(statusColumns).map(([statusValue, columnName]) => (
                    <MenuItem
                        key={statusValue}
                        onClick={(e) => { e.stopPropagation(); handleSelect(statusValue); }}
                        sx={{
                            minWidth: '150px',
                        }}
                    >
                        {columnName}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}

export default StatusDropdown;