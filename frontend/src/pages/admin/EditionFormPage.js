import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import axiosWrapper from '../../utils/AxiosWrapper';

const EditionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    public: false,
    open_to_upload: false,
    open_to_update: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchEdition();
    }
  }, [id]);

  const fetchEdition = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();
      const response = await client.get(`/api/editions/${id}/`);
      setFormData({
        title: response.data.title || '',
        description: response.data.description || '',
        public: response.data.public || false,
        open_to_upload: response.data.open_to_upload || false,
        open_to_update: response.data.open_to_update || false,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching edition:', err);
      setError('Error al cargar la edición');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const client = axiosWrapper();

      if (isEdit) {
        await client.put(`/api/editions/${id}/`, formData);
      } else {
        await client.post('/api/editions/', formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/app/admin/editions');
      }, 1500);
    } catch (err) {
      console.error('Error saving edition:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al guardar la edición'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <AdminLayout title={isEdit ? 'Editar Edición' : 'Nueva Edición'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? 'Editar Edición' : 'Nueva Edición'}
      breadcrumbs={[
        { label: 'Ediciones', href: '/app/admin/editions' },
        { label: isEdit ? 'Editar' : 'Nueva', href: '#' },
      ]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Edición guardada correctamente. Redirigiendo...
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Title */}
            <TextField
              label="Título"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
              helperText="Nombre de la edición (ej: Posadas Party 2025)"
            />

            {/* Description */}
            <TextField
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
              helperText="Descripción detallada de la edición"
            />

            {/* Switches */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    name="public"
                    checked={formData.public}
                    onChange={handleChange}
                  />
                }
                label="Edición pública (visible para todos)"
              />
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    name="open_to_upload"
                    checked={formData.open_to_upload}
                    onChange={handleChange}
                  />
                }
                label="Abierta para envío de producciones"
              />
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    name="open_to_update"
                    checked={formData.open_to_update}
                    onChange={handleChange}
                  />
                }
                label="Permitir actualizar producciones existentes"
              />
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={() => navigate('/app/admin/editions')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Edición'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </AdminLayout>
  );
};

export default EditionFormPage;
