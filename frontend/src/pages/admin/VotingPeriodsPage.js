import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmDialog from '../../components/admin/common/ConfirmDialog';
import axiosWrapper from '../../utils/AxiosWrapper';

const VotingPeriodsPage = () => {
  const [periods, setPeriods] = useState([]);
  const [editions, setEditions] = useState([]);
  const [compos, setCompos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formDialog, setFormDialog] = useState({ open: false, period: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, period: null });
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    edition: '',
    compo: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();
      const [periodsRes, editionsRes, composRes] = await Promise.all([
        client.get('/api/voting-periods/'),
        client.get('/api/editions/'),
        client.get('/api/compos/'),
      ]);
      setPeriods(periodsRes.data);
      setEditions(editionsRes.data);
      setCompos(composRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los períodos de votación');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (period = null) => {
    if (period) {
      setFormData({
        edition: period.edition,
        compo: period.compo || '',
        start_date: period.start_date ? period.start_date.slice(0, 16) : '',
        end_date: period.end_date ? period.end_date.slice(0, 16) : '',
        is_active: period.is_active,
      });
    } else {
      setFormData({
        edition: '',
        compo: '',
        start_date: '',
        end_date: '',
        is_active: true,
      });
    }
    setFormDialog({ open: true, period });
  };

  const handleCloseForm = () => {
    setFormDialog({ open: false, period: null });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const client = axiosWrapper();

      const payload = {
        edition: formData.edition,
        compo: formData.compo || null,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        is_active: formData.is_active,
      };

      if (formDialog.period) {
        await client.put(`/api/voting-periods/${formDialog.period.id}/`, payload);
      } else {
        await client.post('/api/voting-periods/', payload);
      }

      await fetchData();
      handleCloseForm();
    } catch (err) {
      console.error('Error saving period:', err);
      const detail = err.response?.data;
      if (detail && typeof detail === 'object') {
        const messages = Object.entries(detail)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('; ');
        setError(messages);
      } else {
        setError('Error al guardar el período de votación');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const client = axiosWrapper();
      await client.delete(`/api/voting-periods/${deleteDialog.period.id}/`);
      await fetchData();
      setDeleteDialog({ open: false, period: null });
    } catch (err) {
      console.error('Error deleting period:', err);
      setError('Error al eliminar el período de votación');
    }
  };

  const getStatusChip = (period) => {
    if (!period.is_active) {
      return <Chip label="Inactivo" color="default" size="small" />;
    }
    if (period.is_open) {
      return <Chip label="Abierto" color="success" size="small" />;
    }
    const now = new Date();
    const start = new Date(period.start_date);
    if (start > now) {
      return <Chip label="Programado" color="info" size="small" />;
    }
    return <Chip label="Cerrado" color="error" size="small" />;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Períodos de Votación">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Períodos de Votación"
      breadcrumbs={[{ label: 'Votación', href: '/admin/voting-config' }, { label: 'Períodos' }]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Nuevo Período
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Edición</TableCell>
                <TableCell>Competición</TableCell>
                <TableCell>Inicio</TableCell>
                <TableCell>Fin</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {periods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No hay períodos de votación configurados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                periods.map((period) => (
                  <TableRow key={period.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {period.edition_title || editions.find((e) => e.id === period.edition)?.title || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {period.compo_name || (period.compo ? compos.find((c) => c.id === period.compo)?.name : 'Todas')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(period.start_date)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(period.end_date)}</Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(period)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(period)}
                        title="Editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog({ open: true, period })}
                        title="Eliminar"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Form Dialog */}
      <Dialog open={formDialog.open} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {formDialog.period ? 'Editar Período' : 'Nuevo Período de Votación'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Edición</InputLabel>
                <Select
                  value={formData.edition}
                  onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                  label="Edición"
                >
                  {editions.map((edition) => (
                    <MenuItem key={edition.id} value={edition.id}>
                      {edition.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Competición (opcional)</InputLabel>
                <Select
                  value={formData.compo}
                  onChange={(e) => setFormData({ ...formData, compo: e.target.value })}
                  label="Competición (opcional)"
                >
                  <MenuItem value="">Todas las compos</MenuItem>
                  {compos.map((compo) => (
                    <MenuItem key={compo.id} value={compo.id}>
                      {compo.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Inicio de Votación"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Fin de Votación"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Período activo"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Si está desactivado, la votación no se abrirá aunque esté dentro del rango de fechas.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, period: null })}
        onConfirm={handleDelete}
        title="Eliminar Período"
        message="¿Estás seguro de que deseas eliminar este período de votación? Esta acción no se puede deshacer."
      />
    </AdminLayout>
  );
};

export default VotingPeriodsPage;
