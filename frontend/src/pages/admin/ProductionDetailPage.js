import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Download as DownloadIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmDialog from '../../components/admin/common/ConfirmDialog';
import axiosWrapper from '../../utils/AxiosWrapper';

const ProductionDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [production, setProduction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusDialog, setStatusDialog] = useState({ open: false, status: null });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProduction();
  }, [id]);

  const fetchProduction = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();
      const response = await client.get(`/api/productions/${id}/`);
      setProduction(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching production:', err);
      setError('Error al cargar la producción');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      setUpdating(true);
      const client = axiosWrapper();
      await client.patch(`/api/productions/${id}/`, {
        status: statusDialog.status,
      });
      await fetchProduction();
      setStatusDialog({ open: false, status: null });
      setError(null);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', color: 'warning', icon: <PendingIcon fontSize="small" /> },
      approved: { label: 'Aprobada', color: 'success', icon: <ApprovedIcon fontSize="small" /> },
      rejected: { label: 'Rechazada', color: 'error', icon: <RejectedIcon fontSize="small" /> },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="medium"
        icon={config.icon}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Detalle de Producción">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error || !production) {
    return (
      <AdminLayout title="Detalle de Producción">
        <Alert severity="error">{error || 'Producción no encontrada'}</Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={production.title}
      breadcrumbs={[
        { label: 'Producciones', href: '/app/admin/productions' },
        { label: production.title, href: '#' },
      ]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/app/admin/productions')}
        >
          Volver
        </Button>
        {production.status !== 'approved' && (
          <Button
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            onClick={() => setStatusDialog({ open: true, status: 'approved' })}
            disabled={updating}
          >
            Aprobar
          </Button>
        )}
        {production.status !== 'rejected' && (
          <Button
            variant="contained"
            color="error"
            startIcon={<RejectIcon />}
            onClick={() => setStatusDialog({ open: true, status: 'rejected' })}
            disabled={updating}
          >
            Rechazar
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main Info */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información de la Producción
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Título
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {production.title}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Autores
              </Typography>
              <Typography variant="body1">{production.authors || '-'}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Descripción
              </Typography>
              <Typography variant="body1">{production.description || '-'}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Edición
              </Typography>
              <Typography variant="body1">{production.edition_title || '-'}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Competición
              </Typography>
              <Typography variant="body1">{production.compo_name || '-'}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Estado
              </Typography>
              <Box sx={{ mt: 1 }}>{getStatusChip(production.status)}</Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Enviado por
              </Typography>
              <Typography variant="body1">
                {production.uploaded_by?.email || '-'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Fecha de envío
              </Typography>
              <Typography variant="body1">{formatDate(production.created)}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Última modificación
              </Typography>
              <Typography variant="body1">{formatDate(production.modified)}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Stats Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estadísticas
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" color="primary">
                  {production.ranking || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Posición
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" color="primary">
                  {production.score?.toFixed(2) || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Puntuación
                </Typography>
              </Box>

              <Box>
                <Typography variant="h3" color="primary">
                  {production.votes_count || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Votos
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Files Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Archivos
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {production.files && production.files.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="right">Tamaño</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {production.files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {file.original_filename}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={file.file_type || 'Desconocido'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {file.file_size
                              ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB`
                              : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<DownloadIcon />}
                            component={Link}
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Descargar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                No hay archivos asociados a esta producción
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, status: null })}
        onConfirm={handleStatusChange}
        title={`${statusDialog.status === 'approved' ? 'Aprobar' : 'Rechazar'} Producción`}
        message={`¿Estás seguro de que deseas ${
          statusDialog.status === 'approved' ? 'aprobar' : 'rechazar'
        } la producción "${production.title}"?`}
      />
    </AdminLayout>
  );
};

export default ProductionDetailPage;
