/**
 * @fileoverview Home page
 * @module Groups
 * @requires images
 * @requires Fade
 * @requires @mui/material
 * @requires ./Navbar
 * @requires React
 */

import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Navbar from './Navbar';
import image from './../assets/images.png';

function Home() {

    return (
        <>
            <Navbar />
            <Container
                maxWidth="md"
                sx={{
                    minHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    py: 6
                }}
            >
                <Fade in timeout={600}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Welcome to the SyncEdge
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                            Organize the chaos, one task at a time.
                        </Typography>
                        <img
                            src={image}
                            alt="SYNC EDGE Logo"
                            style={{
                                width: '250px',
                                height: 'auto',
                                display: 'unset'
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                    </Box>
                </Fade>
            </Container>
        </>
    );
}

export default Home;