import React, { useState, useEffect, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { ConfirmDialog, LoadingSpinner, StatusChip, EmptyState } from '../../components/admin/common';
import { formatDateTime } from '../../utils/dateFormatting';
import axiosWrapper from '../../utils/AxiosWrapper';

const REJECTION_REASONS = [
  { value: 'technical', label: 'No cumple requisitos técnicos' },
  { value: 'inappropriate', label: 'Contenido inapropiado' },
  { value: 'wrong_compo', label: 'Compo incorrecta' },
  { value: 'duplicate', label: 'Duplicado' },
  { value: 'other', label: 'Otro' },
];

const ProductionDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [production, setProduction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Approve dialog
  const [approveDialog, setApproveDialog] = useState(false);

  // Reject dialog
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  const fetchProduction = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchProduction();
  }, [fetchProduction]);

  const handleApprove = async () => {
    try {
      setUpdating(true);
      const client = axiosWrapper();
      await client.patch(`/api/productions/${id}/update_status/`, {
        status: 'approved',
      });
      await fetchProduction();
      setApproveDialog(false);
      setError(null);
    } catch (err) {
      console.error('Error approving production:', err);
      setError('Error al aprobar la producción');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    try {
      setUpdating(true);
      const client = axiosWrapper();
      await client.patch(`/api/productions/${id}/update_status/`, {
        status: 'rejected',
        rejection_reason: rejectionReason,
        rejection_notes: rejectionNotes,
      });
      await fetchProduction();
      setRejectDialog(false);
      setRejectionReason('');
      setRejectionNotes('');
      setError(null);
    } catch (err) {
      console.error('Error rejecting production:', err);
      setError('Error al rechazar la producción');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Detalle de Producción">
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  if (error && !production) {
    return (
      <AdminLayout title="Detalle de Producción">
        <Alert severity="error">{error || 'Producción no encontrada'}</Alert>
      </AdminLayout>
    );
  }

  if (!production) {
    return (
      <AdminLayout title="Detalle de Producción">
        <Alert severity="error">Producción no encontrada</Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={production.title}
      breadcrumbs={[
        { label: 'Producciones', href: '/admin/productions' },
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
          onClick={() => navigate('/admin/productions')}
        >
          Volver
        </Button>
        {production.status !== 'approved' && (
          <Button
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            onClick={() => setApproveDialog(true)}
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
            onClick={() => setRejectDialog(true)}
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
              <Box sx={{ mt: 1 }}><StatusChip status={production.status} size="medium" /></Box>
            </Box>

            {/* Rejection info */}
            {production.status === 'rejected' && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(244, 67, 54, 0.08)', borderRadius: 1, border: '1px solid rgba(244, 67, 54, 0.2)' }}>
                <Typography variant="body2" color="error" fontWeight={600} gutterBottom>
                  Motivo de rechazo
                </Typography>
                <Typography variant="body1">
                  {REJECTION_REASONS.find(r => r.value === production.rejection_reason)?.label || production.rejection_reason || '-'}
                </Typography>
                {production.rejection_notes && (
                  <>
                    <Typography variant="body2" color="error" fontWeight={600} sx={{ mt: 1 }} gutterBottom>
                      Notas
                    </Typography>
                    <Typography variant="body1">
                      {production.rejection_notes}
                    </Typography>
                  </>
                )}
                {production.reviewed_by && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Revisado por {production.reviewed_by.email} el {formatDateTime(production.reviewed_at)}
                  </Typography>
                )}
              </Box>
            )}

            {production.status === 'approved' && production.reviewed_by && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Aprobado por {production.reviewed_by.email} el {formatDateTime(production.reviewed_at)}
                </Typography>
              </Box>
            )}

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
              <Typography variant="body1">{formatDateTime(production.created)}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Última modificación
              </Typography>
              <Typography variant="body1">{formatDateTime(production.modified)}</Typography>
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
              <EmptyState message="No hay archivos asociados a esta producción" />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Approve dialog */}
      <ConfirmDialog
        open={approveDialog}
        onClose={() => setApproveDialog(false)}
        onConfirm={handleApprove}
        title="Aprobar Producción"
        message={`¿Estás seguro de que deseas aprobar la producción "${production.title}"?`}
      />

      {/* Reject dialog with reason selection */}
      <Dialog
        open={rejectDialog}
        onClose={() => setRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rechazar Producción</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas rechazar la producción "{production.title}"?
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Motivo de rechazo</InputLabel>
            <Select
              value={rejectionReason}
              label="Motivo de rechazo"
              onChange={(e) => setRejectionReason(e.target.value)}
            >
              {REJECTION_REASONS.map((reason) => (
                <MenuItem key={reason.value} value={reason.value}>
                  {reason.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notas adicionales"
            placeholder="Detalles sobre el motivo de rechazo..."
            value={rejectionNotes}
            onChange={(e) => setRejectionNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={updating || !rejectionReason}
          >
            Rechazar
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default ProductionDetailPage;
