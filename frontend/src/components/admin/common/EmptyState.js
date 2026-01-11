import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

/**
 * Reusable empty state component for lists/tables
 * @param {string} message - Primary message to display
 * @param {string} description - Secondary description (optional)
 * @param {React.ReactNode} icon - Custom icon (default: InboxIcon)
 * @param {string} actionLabel - Button label (optional)
 * @param {function} onAction - Button click handler (optional)
 */
const EmptyState = ({
  message = 'No hay datos disponibles',
  description,
  icon: Icon = InboxIcon,
  actionLabel,
  onAction,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
      }}
    >
      <Icon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {message}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
