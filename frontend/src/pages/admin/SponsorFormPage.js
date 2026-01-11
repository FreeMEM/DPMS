import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { LoadingSpinner } from '../../components/admin/common';
import { sponsorsAPI, editionsAPI } from '../../services/api';

const SponsorFormPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    display_order: 0,
    editions: [],
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchEditions();
    if (isEditing) {
      fetchSponsor();
    } else {
      setLoadingData(false);
    }
  }, [id]);

  const fetchEditions = async () => {
    try {
      const response = await editionsAPI.list();
      setEditions(response.data);
    } catch (err) {
      console.error('Error fetching editions:', err);
    }
  };

  const fetchSponsor = async () => {
    try {
      setLoadingData(true);
      const response = await sponsorsAPI.get(id);
      const sponsor = response.data;
      setFormData({
        name: sponsor.name || '',
        url: sponsor.url || '',
        description: sponsor.description || '',
        display_order: sponsor.display_order || 0,
        editions: sponsor.editions || [],
      });
      if (sponsor.logo) {
        setLogoPreview(sponsor.logo);
      }
    } catch (err) {
      console.error('Error fetching sponsor:', err);
      setError(t('Error loading sponsor'));
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditionsChange = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      editions: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('url', formData.url || '');
      submitData.append('description', formData.description || '');
      submitData.append('display_order', formData.display_order);

      // Append editions
      formData.editions.forEach((editionId) => {
        submitData.append('editions', editionId);
      });

      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      if (isEditing) {
        await sponsorsAPI.patch(id, submitData);
        setSuccess(t('Sponsor updated successfully'));
      } else {
        await sponsorsAPI.create(submitData);
        setSuccess(t('Sponsor created successfully'));
        setTimeout(() => navigate('/admin/sponsors'), 1500);
      }
    } catch (err) {
      console.error('Error saving sponsor:', err);
      setError(err.response?.data?.detail || t('Error saving sponsor'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <AdminLayout title={isEditing ? t("Edit Sponsor") : t("New Sponsor")}>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEditing ? t("Edit Sponsor") : t("New Sponsor")}
      breadcrumbs={[
        { label: t('Sponsors'), href: '/admin/sponsors' },
        { label: isEditing ? t('Edit') : t('New') },
      ]}
    >
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/admin/sponsors')}
        >
          {t('Back to Sponsors')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Name */}
            <TextField
              label={t("Name")}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />

            {/* URL */}
            <TextField
              label={t("Website URL")}
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
              fullWidth
              placeholder="https://example.com"
            />

            {/* Description */}
            <TextField
              label={t("Description")}
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />

            {/* Display Order */}
            <TextField
              label={t("Display Order")}
              name="display_order"
              type="number"
              value={formData.display_order}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0 }}
              helperText={t("Lower numbers appear first")}
            />

            {/* Logo */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t("Logo")}
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="logo-upload"
                type="file"
                onChange={handleLogoChange}
              />
              <label htmlFor="logo-upload">
                <Button variant="outlined" component="span">
                  {t("Upload Logo")}
                </Button>
              </label>
              {logoPreview && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    style={{
                      maxHeight: 100,
                      maxWidth: 200,
                      objectFit: 'contain',
                      border: '1px solid #ccc',
                      borderRadius: 4,
                      padding: 8,
                      backgroundColor: '#fff',
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Editions */}
            <FormControl fullWidth>
              <InputLabel>{t("Editions")}</InputLabel>
              <Select
                multiple
                value={formData.editions}
                onChange={handleEditionsChange}
                input={<OutlinedInput label={t("Editions")} />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const edition = editions.find((e) => e.id === value);
                      return (
                        <Chip
                          key={value}
                          label={edition?.title || value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {editions.map((edition) => (
                  <MenuItem key={edition.id} value={edition.id}>
                    {edition.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/sponsors')}
              >
                {t("Cancel")}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? t('Saving...') : isEditing ? t('Update') : t('Create')}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </AdminLayout>
  );
};

export default SponsorFormPage;
