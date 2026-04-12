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
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Slider,
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

const VotingConfigPage = () => {
  const [configs, setConfigs] = useState([]);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formDialog, setFormDialog] = useState({ open: false, config: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, config: null });
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    edition: '',
    voting_mode: 'public',
    public_weight: 100,
    jury_weight: 0,
    access_mode: 'open',
    show_partial_results: false,
    show_score_breakdown: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();
      const [configsRes, editionsRes] = await Promise.all([
        client.get('/api/voting-config/'),
        client.get('/api/editions/'),
      ]);
      setConfigs(configsRes.data);
      setEditions(editionsRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar las configuraciones de votación');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (config = null) => {
    if (config) {
      setFormData({
        edition: config.edition,
        voting_mode: config.voting_mode,
        public_weight: config.public_weight,
        jury_weight: config.jury_weight,
        access_mode: config.access_mode,
        show_partial_results: config.show_partial_results,
        show_score_breakdown: config.show_score_breakdown,
      });
    } else {
      setFormData({
        edition: '',
        voting_mode: 'public',
        public_weight: 100,
        jury_weight: 0,
        access_mode: 'open',
        show_partial_results: false,
    show_score_breakdown: false,
      });
    }
    setFormDialog({ open: true, config });
  };

  const handleCloseForm = () => {
    setFormDialog({ open: false, config: null });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const client = axiosWrapper();

      if (formDialog.config) {
        await client.put(`/api/voting-config/${formDialog.config.id}/`, formData);
      } else {
        await client.post('/api/voting-config/', formData);
      }

      await fetchData();
      handleCloseForm();
    } catch (err) {
      console.error('Error saving config:', err);
      setError('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const client = axiosWrapper();
      await client.delete(`/api/voting-config/${deleteDialog.config.id}/`);
      await fetchData();
      setDeleteDialog({ open: false, config: null });
    } catch (err) {
      console.error('Error deleting config:', err);
      setError('Error al eliminar la configuración');
    }
  };

  const getVotingModeChip = (mode) => {
    const modes = {
      public: { label: '100% Público', color: 'primary' },
      jury: { label: '100% Jurado', color: 'secondary' },
      mixed: { label: 'Mixto', color: 'info' },
    };
    const config = modes[mode] || modes.public;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getAccessModeChip = (mode) => {
    const modes = {
      open: { label: 'Abierto', color: 'success' },
      code: { label: 'Código Asistencia', color: 'warning' },
      manual: { label: 'Verificación Manual', color: 'info' },
      checkin: { label: 'QR Check-in', color: 'secondary' },
    };
    const config = modes[mode] || modes.open;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (loading) {
    return (
      <AdminLayout title="Configuración de Votación">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Configuración de Votación"
      breadcrumbs={[{ label: 'Votación', href: '#' }]}
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
          Nueva Configuración
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Edición</TableCell>
                <TableCell>Modo Votación</TableCell>
                <TableCell>Pesos</TableCell>
                <TableCell>Método Acceso</TableCell>
                <TableCell>Resultados Parciales</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No hay configuraciones. Crea una nueva para comenzar.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                configs.map((config) => (
                  <TableRow key={config.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {config.edition_detail?.title || editions.find((e) => e.id === config.edition)?.title || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{getVotingModeChip(config.voting_mode)}</TableCell>
                    <TableCell>
                      {config.voting_mode === 'mixed' ? (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Público: {config.public_weight}% / Jurado: {config.jury_weight}%
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{getAccessModeChip(config.access_mode)}</TableCell>
                    <TableCell>
                      <Chip
                        label={config.show_partial_results ? 'Sí' : 'No'}
                        color={config.show_partial_results ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(config)}
                        title="Editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog({ open: true, config })}
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
          {formDialog.config ? 'Editar Configuración' : 'Nueva Configuración'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Edición</InputLabel>
                <Select
                  value={formData.edition}
                  onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                  label="Edición"
                  disabled={!!formDialog.config}
                >
                  {editions.map((edition) => (
                    <MenuItem key={edition.id} value={edition.id}>
                      {edition.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Modo de Votación</InputLabel>
                <Select
                  value={formData.voting_mode}
                  onChange={(e) => {
                    const mode = e.target.value;
                    const weights = mode === 'public'
                      ? { public_weight: 100, jury_weight: 0 }
                      : mode === 'jury'
                        ? { public_weight: 0, jury_weight: 100 }
                        : { public_weight: formData.public_weight, jury_weight: formData.jury_weight };
                    setFormData({ ...formData, voting_mode: mode, ...weights });
                  }}
                  label="Modo de Votación"
                >
                  <MenuItem value="public">100% Público</MenuItem>
                  <MenuItem value="jury">100% Jurado</MenuItem>
                  <MenuItem value="mixed">Mixto (Público + Jurado)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.voting_mode === 'mixed' && (
              <Grid item xs={12}>
                <Typography gutterBottom>Pesos de Votación</Typography>
                <Box sx={{ px: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Público: {formData.public_weight}% / Jurado: {formData.jury_weight}%
                  </Typography>
                  <Slider
                    value={formData.public_weight}
                    onChange={(e, value) =>
                      setFormData({
                        ...formData,
                        public_weight: value,
                        jury_weight: 100 - value,
                      })
                    }
                    min={0}
                    max={100}
                    step={5}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Modo de Acceso</InputLabel>
                <Select
                  value={formData.access_mode}
                  onChange={(e) => setFormData({ ...formData, access_mode: e.target.value })}
                  label="Modo de Acceso"
                >
                  <MenuItem value="open">Abierto (cualquiera puede votar)</MenuItem>
                  <MenuItem value="code">Código de Asistencia</MenuItem>
                  <MenuItem value="manual">Verificación Manual</MenuItem>
                  <MenuItem value="checkin">QR Check-in</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.show_partial_results}
                    onChange={(e) => setFormData({ ...formData, show_partial_results: e.target.checked })}
                  />
                }
                label="Mostrar resultados parciales durante la votación"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.show_score_breakdown}
                    onChange={(e) => setFormData({ ...formData, show_score_breakdown: e.target.checked })}
                  />
                }
                label="Mostrar desglose de puntuación (público vs jurado)"
              />
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
        onClose={() => setDeleteDialog({ open: false, config: null })}
        onConfirm={handleDelete}
        title="Eliminar Configuración"
        message="¿Estás seguro de que deseas eliminar esta configuración de votación? Esta acción no se puede deshacer."
      />
    </AdminLayout>
  );
};

export default VotingConfigPage;
