import React from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * Reusable loading spinner component with centered layout
 * @param {number} padding - Padding around spinner (default: 4)
 * @param {string} size - CircularProgress size (default: 40)
 */
const LoadingSpinner = ({ padding = 4, size = 40 }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: padding }}>
      <CircularProgress size={size} />
    </Box>
  );
};

export default LoadingSpinner;
