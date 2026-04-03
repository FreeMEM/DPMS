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
  Tabs,
  Tab,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import axiosWrapper from '../../utils/AxiosWrapper';

const LangTabs = ({ label, esValue, enValue, onChange, rows = 3, helperText, disabled }) => {
  const [tab, setTab] = useState(0);
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
        <Typography variant="body2" fontWeight={500}>{label}</Typography>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ minHeight: 32, '& .MuiTab-root': { minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' } }}>
          <Tab label="ES" />
          <Tab label="EN" />
        </Tabs>
      </Box>
      {tab === 0 && (
        <TextField
          fullWidth
          value={esValue}
          onChange={(e) => onChange('es', e.target.value)}
          multiline
          rows={rows}
          disabled={disabled}
          helperText={helperText}
        />
      )}
      {tab === 1 && (
        <TextField
          fullWidth
          value={enValue}
          onChange={(e) => onChange('en', e.target.value)}
          multiline
          rows={rows}
          disabled={disabled}
          helperText="English version"
          placeholder="English translation..."
        />
      )}
    </Box>
  );
};

const CompoFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description_es: '',
    description_en: '',
    rules_es: '',
    rules_en: '',
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
      const d = response.data;
      setFormData({
        name: d.name || '',
        description_es: d.description_es || d.description || '',
        description_en: d.description_en || '',
        rules_es: d.rules_es || d.rules || '',
        rules_en: d.rules_en || '',
        icon: d.icon || '',
        display_order: d.display_order || 0,
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

  const handleLangChange = (field, lang, value) => {
    setFormData((prev) => ({ ...prev, [`${field}_${lang}`]: value }));
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

      const payload = {
        name: formData.name,
        description: formData.description_es,
        description_es: formData.description_es,
        description_en: formData.description_en,
        rules: formData.rules_es,
        rules_es: formData.rules_es,
        rules_en: formData.rules_en,
      };

      if (isEdit) {
        await client.put(`/api/compos/${id}/`, payload);
      } else {
        await client.post('/api/compos/', payload);
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
              <LangTabs
                label="Descripción"
                esValue={formData.description_es}
                enValue={formData.description_en}
                onChange={(lang, val) => handleLangChange('description', lang, val)}
                rows={3}
                helperText="Descripción breve de la competición"
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12}>
              <LangTabs
                label="Reglas"
                esValue={formData.rules_es}
                enValue={formData.rules_en}
                onChange={(lang, val) => handleLangChange('rules', lang, val)}
                rows={6}
                helperText="Reglas y restricciones de la competición (markdown soportado)"
                disabled={saving}
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
