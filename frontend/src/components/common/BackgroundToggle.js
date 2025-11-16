import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

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

  const handleToggle = () => {
    setBackgroundEnabled(prev => !prev);
  };

  return (
    <Tooltip title={backgroundEnabled ? 'Desactivar fondo animado' : 'Activar fondo animado'}>
      <IconButton
        onClick={handleToggle}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          bgcolor: 'background.paper',
          boxShadow: 3,
          '&:hover': {
            bgcolor: 'background.paper',
            boxShadow: 6,
          },
        }}
      >
        {backgroundEnabled ? <Visibility /> : <VisibilityOff />}
      </IconButton>
    </Tooltip>
  );
};

export default BackgroundToggle;
