import React, { useState, useEffect } from 'react';
import { Box, Switch, Typography, Paper, Select, MenuItem, FormControl } from '@mui/material';
import { availableEffects } from './backgroundEffects';

const BackgroundToggle = () => {
  const [backgroundEnabled, setBackgroundEnabled] = useState(() => {
    // Leer preferencia de localStorage, por defecto true
    const saved = localStorage.getItem('backgroundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [selectedEffect, setSelectedEffect] = useState(() => {
    // Leer efecto seleccionado de localStorage, por defecto 'auto'
    const saved = localStorage.getItem('selectedEffect');
    return saved || 'auto';
  });

  useEffect(() => {
    // Guardar preferencia en localStorage
    localStorage.setItem('backgroundEnabled', JSON.stringify(backgroundEnabled));

    // Disparar evento personalizado para que ThreeBackground pueda reaccionar
    window.dispatchEvent(new CustomEvent('backgroundToggle', {
      detail: { enabled: backgroundEnabled }
    }));
  }, [backgroundEnabled]);

  useEffect(() => {
    // Guardar efecto seleccionado en localStorage
    localStorage.setItem('selectedEffect', selectedEffect);

    // Disparar evento para cambiar el efecto
    window.dispatchEvent(new CustomEvent('effectChange', {
      detail: { effect: selectedEffect }
    }));
  }, [selectedEffect]);

  const handleToggle = (event) => {
    setBackgroundEnabled(event.target.checked);
  };

  const handleEffectChange = (event) => {
    setSelectedEffect(event.target.value);
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
        gap: 2,
        boxShadow: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          Efectos
        </Typography>
        <Switch
          checked={backgroundEnabled}
          onChange={handleToggle}
          size="small"
        />
      </Box>

      {backgroundEnabled && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={selectedEffect}
            onChange={handleEffectChange}
            sx={{
              fontSize: '0.875rem',
              height: '32px',
            }}
          >
            <MenuItem value="auto">Auto</MenuItem>
            {availableEffects.map((effect, index) => (
              <MenuItem key={index} value={index.toString()}>
                {effect.name.charAt(0).toUpperCase() + effect.name.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Paper>
  );
};

export default BackgroundToggle;
