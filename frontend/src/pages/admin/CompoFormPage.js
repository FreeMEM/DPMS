import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import axiosWrapper from '../../utils/AxiosWrapper';

const CompoFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
    icon: '',
    display_order: 0,
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchCompo();
    }
  }, [id]);

  const fetchCompo = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();
      const response = await client.get(`/api/compos/${id}/`);
      setFormData({
        name: response.data.name || '',
        description: response.data.description || '',
        rules: response.data.rules || '',
        icon: response.data.icon || '',
        display_order: response.data.display_order || 0,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching compo:', err);
      setError('Error al cargar la competición');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'display_order' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const client = axiosWrapper();

      if (isEdit) {
        await client.put(`/api/compos/${id}/`, formData);
      } else {
        await client.post('/api/compos/', formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/compos');
      }, 1500);
    } catch (err) {
      console.error('Error saving compo:', err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.name?.[0] ||
          'Error al guardar la competición'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isEdit ? 'Editar Competición' : 'Nueva Competición'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? 'Editar Competición' : 'Nueva Competición'}
      breadcrumbs={[
        { label: 'Competiciones', href: '/admin/compos' },
        { label: isEdit ? 'Editar' : 'Nueva', href: '#' },
      ]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Competición {isEdit ? 'actualizada' : 'creada'} exitosamente
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={saving}
                helperText="Nombre de la competición (ej: Demo, Graphics, Music)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                disabled={saving}
                helperText="Descripción breve de la competición"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reglas"
                name="rules"
                value={formData.rules}
                onChange={handleChange}
                multiline
                rows={6}
                disabled={saving}
                helperText="Reglas y restricciones de la competición (markdown soportado)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Icono"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                disabled={saving}
                helperText="Emoji o icono para representar la competición"
                placeholder="🎨"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Orden de visualización"
                name="display_order"
                value={formData.display_order}
                onChange={handleChange}
                disabled={saving}
                helperText="Orden en que se muestra (menor = primero)"
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<BackIcon />}
                  onClick={() => navigate('/admin/compos')}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {saving
                    ? 'Guardando...'
                    : isEdit
                    ? 'Actualizar Competición'
                    : 'Crear Competición'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </AdminLayout>
  );
};

export default CompoFormPage;
