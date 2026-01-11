import React from 'react';
import { Chip } from '@mui/material';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import ApprovedIcon from '@mui/icons-material/CheckCircle';
import RejectedIcon from '@mui/icons-material/Cancel';

/**
 * Status configuration for different entity states
 */
const STATUS_CONFIG = {
  // Production status
  pending: { label: 'Pendiente', color: 'warning', icon: <PendingIcon fontSize="small" /> },
  approved: { label: 'Aprobada', color: 'success', icon: <ApprovedIcon fontSize="small" /> },
  rejected: { label: 'Rechazada', color: 'error', icon: <RejectedIcon fontSize="small" /> },
  // Generic boolean status
  active: { label: 'Activo', color: 'success' },
  inactive: { label: 'Inactivo', color: 'default' },
  // Visibility status
  public: { label: 'Pública', color: 'success' },
  private: { label: 'Privada', color: 'default' },
  // Open/Closed status
  open: { label: 'Abierto', color: 'success' },
  closed: { label: 'Cerrado', color: 'error' },
};

/**
 * Reusable status chip component
 * @param {string} status - Status key (pending, approved, rejected, etc.)
 * @param {string} size - Chip size (default: 'small')
 * @param {boolean} showIcon - Whether to show icon (default: true)
 */
const StatusChip = ({ status, size = 'small', showIcon = true }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={showIcon && config.icon ? config.icon : undefined}
    />
  );
};

export default StatusChip;
export { STATUS_CONFIG };
