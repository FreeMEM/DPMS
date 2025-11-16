import React, { useState, useEffect } from 'react';
import { Box, Switch, Typography, Paper } from '@mui/material';

const BackgroundToggle = () => {
  const [backgroundEnabled, setBackgroundEnabled] = useState(() => {
    // Leer preferencia de localStorage, por defecto true
    const saved = localStorage.getItem('backgroundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    // Guardar preferencia en localStorage
    localStorage.setItem('backgroundEnabled', JSON.stringify(backgroundEnabled));

    // Disparar evento personalizado para que ThreeBackground pueda reaccionar
    window.dispatchEvent(new CustomEvent('backgroundToggle', {
      detail: { enabled: backgroundEnabled }
    }));
  }, [backgroundEnabled]);

  const handleToggle = (event) => {
    setBackgroundEnabled(event.target.checked);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        boxShadow: 3,
      }}
    >
      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
        Efectos
      </Typography>
      <Switch
        checked={backgroundEnabled}
        onChange={handleToggle}
        size="small"
      />
    </Paper>
  );
};

export default BackgroundToggle;
