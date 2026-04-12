import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Typography,
  IconButton,
  Card,
  CardMedia,
  Slider,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import axiosWrapper from '../../utils/AxiosWrapper';

const LangTabs = ({ label, esValue, enValue, onChange, rows = 3, helperText, disabled }) => {
  const [tab, setTab] = React.useState(0);
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
        <Typography variant="subtitle2">{label}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {['ES', 'EN'].map((lang, i) => (
            <Button key={lang} size="small" variant={tab === i ? 'contained' : 'outlined'}
              onClick={() => setTab(i)}
              sx={{ minWidth: 36, px: 1, py: 0.25, fontSize: '0.7rem' }}
            >{lang}</Button>
          ))}
        </Box>
      </Box>
      <TextField
        fullWidth
        value={tab === 0 ? esValue : enValue}
        onChange={(e) => onChange(tab === 0 ? 'es' : 'en', e.target.value)}
        multiline
        rows={rows}
        disabled={disabled}
        helperText={tab === 0 ? helperText : 'English version'}
        placeholder={tab === 1 ? 'English translation...' : ''}
      />
    </Box>
  );
};

const EditionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const logoInputRef = useRef(null);
  const posterInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    logo_border_color: '#FFA500',
    logo_border_width: 0,
    public: false,
    open_to_upload: false,
    open_to_update: false,
    productions_public: false,
    auto_approve_productions: true,
    description_es: '',
    description_en: '',
    contact_info_es: '',
    contact_info_en: '',
    travel_info_es: '',
    travel_info_en: '',
    schedule: '',
    what_to_bring: '',
    contact_form_enabled: false,
    contact_email: '',
  });

  // Image states
  const [logoFile, setLogoFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const [existingPoster, setExistingPoster] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchEdition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEdition = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();
      const response = await client.get(`/api/editions/${id}/`);
      const d = response.data;
      setFormData({
        title: d.title || '',
        description: d.description || '',
        start_date: d.start_date ? d.start_date.slice(0, 16) : '',
        end_date: d.end_date ? d.end_date.slice(0, 16) : '',
        logo_border_color: d.logo_border_color || '#FFA500',
        logo_border_width: d.logo_border_width || 0,
        public: d.public || false,
        open_to_upload: d.open_to_upload || false,
        open_to_update: d.open_to_update || false,
        productions_public: d.productions_public || false,
        auto_approve_productions: d.auto_approve_productions !== false,
        description_es: d.description_es || d.description || '',
        description_en: d.description_en || '',
        contact_info_es: d.contact_info_es || d.contact_info || '',
        contact_info_en: d.contact_info_en || '',
        travel_info_es: d.travel_info_es || d.travel_info || '',
        travel_info_en: d.travel_info_en || '',
        schedule: d.schedule || '',
        what_to_bring: d.what_to_bring || '',
        contact_form_enabled: d.contact_form_enabled || false,
        contact_email: d.contact_email || '',
      });
      // Set existing images
      if (response.data.logo) {
        setExistingLogo(response.data.logo);
      }
      if (response.data.poster) {
        setExistingPoster(response.data.poster);
      }
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

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    if (type === 'logo') {
      setLogoFile(file);
      setLogoPreview(previewUrl);
      setExistingLogo(null);
    } else {
      setPosterFile(file);
      setPosterPreview(previewUrl);
      setExistingPoster(null);
    }
  };

  const handleRemoveImage = (type) => {
    if (type === 'logo') {
      setLogoFile(null);
      setLogoPreview(null);
      setExistingLogo(null);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    } else {
      setPosterFile(null);
      setPosterPreview(null);
      setExistingPoster(null);
      if (posterInputRef.current) {
        posterInputRef.current.value = '';
      }
    }
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

      // Use FormData for file uploads
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description_es);
      submitData.append('description_es', formData.description_es);
      submitData.append('description_en', formData.description_en);
      if (formData.start_date) submitData.append('start_date', new Date(formData.start_date).toISOString());
      if (formData.end_date) submitData.append('end_date', new Date(formData.end_date).toISOString());
      submitData.append('logo_border_color', formData.logo_border_color);
      submitData.append('logo_border_width', formData.logo_border_width);
      submitData.append('public', formData.public);
      submitData.append('open_to_upload', formData.open_to_upload);
      submitData.append('open_to_update', formData.open_to_update);
      submitData.append('productions_public', formData.productions_public);
      submitData.append('auto_approve_productions', formData.auto_approve_productions);
      submitData.append('contact_info', formData.contact_info_es);
      submitData.append('contact_info_es', formData.contact_info_es);
      submitData.append('contact_info_en', formData.contact_info_en);
      submitData.append('travel_info', formData.travel_info_es);
      submitData.append('travel_info_es', formData.travel_info_es);
      submitData.append('travel_info_en', formData.travel_info_en);
      submitData.append('schedule', formData.schedule);
      submitData.append('what_to_bring', formData.what_to_bring);
      submitData.append('contact_form_enabled', formData.contact_form_enabled);
      submitData.append('contact_email', formData.contact_email);

      // Add files if selected
      if (logoFile) {
        submitData.append('logo', logoFile);
      }
      if (posterFile) {
        submitData.append('poster', posterFile);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (isEdit) {
        // Use PATCH for partial updates (allows not sending unchanged files)
        await client.patch(`/api/editions/${id}/`, submitData, config);
      } else {
        await client.post('/api/editions/', submitData, config);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/editions');
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
        { label: 'Ediciones', href: '/admin/editions' },
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
            <LangTabs
              label="Descripción"
              esValue={formData.description_es}
              enValue={formData.description_en}
              onChange={(lang, val) => setFormData(prev => ({ ...prev, [`description_${lang}`]: val }))}
              rows={4}
              helperText="Descripción detallada de la edición"
            />

            {/* Dates */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Fecha y hora de inicio"
                name="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Fecha y hora en que comienza la edición"
              />
              <TextField
                label="Fecha y hora de fin"
                name="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Fecha y hora en que termina la edición"
              />
            </Box>

            {/* Images Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Imágenes
            </Typography>

            {/* Logo Upload */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Logo
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {(logoPreview || existingLogo) && (
                  <Card sx={{ maxWidth: 200, position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={logoPreview || existingLogo}
                      alt="Logo preview"
                      sx={{
                        height: 100,
                        objectFit: 'contain',
                        bgcolor: 'grey.900',
                        filter: formData.logo_border_width > 0
                          ? `drop-shadow(0 0 ${formData.logo_border_width}px ${formData.logo_border_color})`
                          : 'none',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage('logo')}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Card>
                )}
                <Box>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'logo')}
                    style={{ display: 'none' }}
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                    >
                      {logoPreview || existingLogo ? 'Cambiar Logo' : 'Subir Logo'}
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                    Imagen del logo de la edición (max 5MB)
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Logo Border Configuration */}
            <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom>
                Borde del Logo (efecto glow)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Añade un resplandor alrededor del logo para mejorar el contraste con fondos oscuros.
                El efecto sigue la forma del logo si tiene transparencia.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 120 }}>
                  <Typography variant="caption" color="text.secondary">
                    Color del borde
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <input
                      type="color"
                      value={formData.logo_border_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, logo_border_color: e.target.value }))}
                      style={{
                        width: 40,
                        height: 40,
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    />
                    <TextField
                      size="small"
                      value={formData.logo_border_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, logo_border_color: e.target.value }))}
                      sx={{ width: 100 }}
                      inputProps={{ style: { fontFamily: 'monospace' } }}
                    />
                  </Box>
                </Box>
                <Box sx={{ minWidth: 200, flexGrow: 1, maxWidth: 300 }}>
                  <Typography variant="caption" color="text.secondary">
                    Grosor del borde: {formData.logo_border_width}px
                  </Typography>
                  <Slider
                    value={formData.logo_border_width}
                    onChange={(e, value) => setFormData(prev => ({ ...prev, logo_border_width: value }))}
                    min={0}
                    max={10}
                    step={1}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 5, label: '5' },
                      { value: 10, label: '10' },
                    ]}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Poster Upload */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Cartel
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {(posterPreview || existingPoster) && (
                  <Card sx={{ maxWidth: 200, position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={posterPreview || existingPoster}
                      alt="Poster preview"
                      sx={{ height: 150, objectFit: 'contain', bgcolor: 'grey.900' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage('poster')}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Card>
                )}
                <Box>
                  <input
                    ref={posterInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'poster')}
                    style={{ display: 'none' }}
                    id="poster-upload"
                  />
                  <label htmlFor="poster-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                    >
                      {posterPreview || existingPoster ? 'Cambiar Cartel' : 'Subir Cartel'}
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                    Imagen del cartel/poster de la edición (max 5MB)
                  </Typography>
                </Box>
              </Box>
            </Box>

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

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    name="productions_public"
                    checked={formData.productions_public}
                    onChange={handleChange}
                  />
                }
                label="Publicar producciones (visibles para todos)"
              />
              <Typography variant="caption" display="block" sx={{ ml: 6, color: 'text.secondary' }}>
                Si está desactivado, los usuarios solo ven sus propias producciones. Activar después de las votaciones.
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="auto_approve_productions"
                    checked={formData.auto_approve_productions}
                    onChange={handleChange}
                  />
                }
                label="Auto-aprobar producciones"
              />
              <Typography variant="caption" display="block" sx={{ ml: 6, color: 'text.secondary' }}>
                Si está activado, las producciones se aprueban automáticamente al subirlas. Si está desactivado, requieren aprobación manual del administrador.
              </Typography>
            </Box>

            {/* Contact & Travel Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Contacto y Cómo Llegar
            </Typography>

            <LangTabs
              label="Información de contacto"
              esValue={formData.contact_info_es}
              enValue={formData.contact_info_en}
              onChange={(lang, val) => setFormData(prev => ({ ...prev, [`contact_info_${lang}`]: val }))}
              rows={5}
              helperText="Emails, redes sociales, Telegram, etc. (markdown soportado)"
            />

            <LangTabs
              label="Cómo llegar"
              esValue={formData.travel_info_es}
              enValue={formData.travel_info_en}
              onChange={(lang, val) => setFormData(prev => ({ ...prev, [`travel_info_${lang}`]: val }))}
              rows={6}
              helperText="Dirección, aeropuertos, trenes, parking, alojamiento (markdown soportado)"
            />

            <TextField
              label="Programa / Horario"
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
              multiline
              rows={6}
              fullWidth
              helperText="Horario del evento (markdown soportado)"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Info Práctica (qué traer, normas, etc.)"
              name="what_to_bring"
              value={formData.what_to_bring}
              onChange={handleChange}
              multiline
              rows={6}
              fullWidth
              helperText="Entrada, qué traer, normas de convivencia, registro (markdown soportado)"
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    name="contact_form_enabled"
                    checked={formData.contact_form_enabled}
                    onChange={handleChange}
                  />
                }
                label="Activar formulario de contacto"
              />
              <TextField
                label="Email de destino"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
                sx={{ flexGrow: 1 }}
                helperText="Los mensajes del formulario se enviarán a este email"
                disabled={!formData.contact_form_enabled}
              />
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={() => navigate('/admin/editions')}
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
