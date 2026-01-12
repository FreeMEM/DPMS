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
  TablePagination,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmDialog from '../../components/admin/common/ConfirmDialog';
import axiosWrapper from '../../utils/AxiosWrapper';

const JuryManagementPage = () => {
  const [juryMembers, setJuryMembers] = useState([]);
  const [editions, setEditions] = useState([]);
  const [compos, setCompos] = useState([]);
  const [, setUsers] = useState([]); // users will be used when search endpoint is implemented
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formDialog, setFormDialog] = useState({ open: false, member: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, member: null });
  const [saving, setSaving] = useState(false);
  const [filterEdition, setFilterEdition] = useState('');
  const [filterCompo, setFilterCompo] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    user: '',
    edition: '',
    compos: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();
      const [membersRes, editionsRes, composRes] = await Promise.all([
        client.get('/api/jury-members/'),
        client.get('/api/editions/'),
        client.get('/api/compos/'),
      ]);
      setJuryMembers(membersRes.data);
      setEditions(editionsRes.data);
      setCompos(composRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los miembros del jurado');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // TODO: Implement user search endpoint
      // For now, we'll use a placeholder
      setUsers([]);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleOpenForm = (member = null) => {
    if (member) {
      setFormData({
        user: member.user,
        edition: member.edition,
        compos: member.compos || [],
      });
    } else {
      setFormData({
        user: '',
        edition: '',
        compos: [],
      });
    }
    setFormDialog({ open: true, member });
    if (!member) {
      fetchUsers();
    }
  };

  const handleCloseForm = () => {
    setFormDialog({ open: false, member: null });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const client = axiosWrapper();

      if (formDialog.member) {
        await client.put(`/api/jury-members/${formDialog.member.id}/`, formData);
        setSuccess('Miembro del jurado actualizado exitosamente');
      } else {
        await client.post('/api/jury-members/', formData);
        setSuccess('Miembro del jurado agregado exitosamente');
      }

      await fetchData();
      handleCloseForm();
    } catch (err) {
      console.error('Error saving jury member:', err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.user?.[0] ||
          'Error al guardar el miembro del jurado'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const client = axiosWrapper();
      await client.delete(`/api/jury-members/${deleteDialog.member.id}/`);
      setSuccess('Miembro del jurado eliminado exitosamente');
      await fetchData();
      setDeleteDialog({ open: false, member: null });
    } catch (err) {
      console.error('Error deleting jury member:', err);
      setError('Error al eliminar el miembro del jurado');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredMembers = juryMembers.filter((member) => {
    const matchesEdition = !filterEdition || member.edition === parseInt(filterEdition, 10);
    const matchesCompo =
      !filterCompo || (member.compos && member.compos.includes(parseInt(filterCompo, 10)));
    return matchesEdition && matchesCompo;
  });

  const paginatedMembers = filteredMembers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <AdminLayout title="Gestión de Jurado">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Gestión de Jurado"
      breadcrumbs={[{ label: 'Jurado', href: '#' }]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Filters and Actions */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Edición</InputLabel>
              <Select
                value={filterEdition}
                onChange={(e) => setFilterEdition(e.target.value)}
                label="Edición"
              >
                <MenuItem value="">Todas</MenuItem>
                {editions.map((edition) => (
                  <MenuItem key={edition.id} value={edition.id}>
                    {edition.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Competición</InputLabel>
              <Select
                value={filterCompo}
                onChange={(e) => setFilterCompo(e.target.value)}
                label="Competición"
              >
                <MenuItem value="">Todas</MenuItem>
                {compos.map((compo) => (
                  <MenuItem key={compo.id} value={compo.id}>
                    {compo.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
            >
              Agregar Miembro
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {juryMembers.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Miembros
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {new Set(juryMembers.map((m) => m.edition)).size}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ediciones con Jurado
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {juryMembers.reduce((sum, m) => sum + (m.voting_progress?.completed || 0), 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Votaciones Completadas
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Jury Members Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Edición</TableCell>
                <TableCell>Competiciones</TableCell>
                <TableCell>Progreso de Votación</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      {filterEdition || filterCompo
                        ? 'No se encontraron miembros del jurado'
                        : 'No hay miembros del jurado. Agrega nuevos miembros para comenzar.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMembers.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {member.user_email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {member.user}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {editions.find((e) => e.id === member.edition)?.title || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {member.compos && member.compos.length > 0 ? (
                          member.compos.map((compoId) => {
                            const compo = compos.find((c) => c.id === compoId);
                            return compo ? (
                              <Chip
                                key={compoId}
                                label={compo.name}
                                size="small"
                                variant="outlined"
                              />
                            ) : null;
                          })
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Todas
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {member.voting_progress ? (
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {member.voting_progress.completed} / {member.voting_progress.total}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.voting_progress.percentage}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={member.voting_progress.percentage || 0}
                            sx={{ height: 6, borderRadius: 1 }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(member)}
                        title="Editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog({ open: true, member })}
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
        <TablePagination
          component="div"
          count={filteredMembers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Form Dialog */}
      <Dialog open={formDialog.open} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {formDialog.member ? 'Editar Miembro del Jurado' : 'Agregar Miembro del Jurado'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ID de Usuario"
                value={formData.user}
                onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                helperText="Ingresa el ID del usuario que será miembro del jurado"
                type="number"
              />
            </Grid>

            <Grid item xs={12}>
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

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Competiciones</InputLabel>
                <Select
                  multiple
                  value={formData.compos}
                  onChange={(e) => setFormData({ ...formData, compos: e.target.value })}
                  label="Competiciones"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const compo = compos.find((c) => c.id === value);
                        return compo ? (
                          <Chip key={value} label={compo.name} size="small" />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  {compos.map((compo) => (
                    <MenuItem key={compo.id} value={compo.id}>
                      {compo.name}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Deja vacío para asignar a todas las competiciones de la edición
                </Typography>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !formData.user || !formData.edition}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, member: null })}
        onConfirm={handleDelete}
        title="Eliminar Miembro del Jurado"
        message={`¿Estás seguro de que deseas eliminar a ${deleteDialog.member?.user_email || 'este miembro'} del jurado? Esta acción no se puede deshacer.`}
      />
    </AdminLayout>
  );
};

export default JuryManagementPage;
