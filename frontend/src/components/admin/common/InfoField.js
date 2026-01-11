import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Reusable info field component for displaying label-value pairs
 * @param {string} label - Field label
 * @param {React.ReactNode} value - Field value (can be string or component)
 * @param {object} sx - Additional styles for the container
 */
const InfoField = ({ label, value, sx = {} }) => {
  return (
    <Box sx={{ mb: 2, ...sx }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body1">{value || '-'}</Typography>
      ) : (
        value || <Typography variant="body1">-</Typography>
      )}
    </Box>
  );
};

export default InfoField;
