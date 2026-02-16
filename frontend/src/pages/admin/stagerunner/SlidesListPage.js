import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
} from '@mui/icons-material';

import AdminLayout from '../../../components/admin/AdminLayout';
import { ConfirmDialog, EmptyState, LoadingSpinner } from '../../../components/admin/common';
import axiosWrapper from '../../../utils/AxiosWrapper';

const slideTypeLabels = {
  custom: 'Custom Layout',
  idle: 'Idle/Waiting',
  countdown: 'Countdown',
  production_list: 'Production List',
  production_show: 'Production Show',
  results: 'Results',
};

const effectLabels = {
  hyperspace: 'Hyperspace',
  wave: 'Wave',
  'energy-grid': 'Energy Grid',
  'tron-grid': 'Tron Grid',
  none: 'None',
  inherit: 'Use Default',
};

const SlidesListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const configId = searchParams.get('config');

  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, slide: null });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedSlide, setSelectedSlide] = useState(null);

  useEffect(() => {
    fetchSlides();
  }, [configId]);

  const fetchSlides = async () => {
    if (!configId || configId === 'null' || configId === 'undefined') {
      navigate('/admin/stagerunner');
      return;
    }

    try {
      setLoading(true);
      const client = axiosWrapper();
      const response = await client.get(`/api/stage-slides/?config=${configId}`);
      setSlides(response.data.results || response.data);
      setLoading(false);
    } catch (err) {
      setError(t('Error loading slides'));
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.slide) return;

    try {
      const client = axiosWrapper();
      await client.delete(`/api/stage-slides/${deleteDialog.slide.id}/`);
      setSlides(slides.filter(s => s.id !== deleteDialog.slide.id));
      setDeleteDialog({ open: false, slide: null });
    } catch (err) {
      setError(t('Error deleting slide'));
    }
  };

  const handleDuplicate = async (slide) => {
    try {
      const client = axiosWrapper();
      const response = await client.post(`/api/stage-slides/${slide.id}/duplicate/`);
      setSlides([...slides, response.data]);
      handleMenuClose();
    } catch (err) {
      setError(t('Error duplicating slide'));
    }
  };

  const handleToggleActive = async (slide) => {
    try {
      const client = axiosWrapper();
      await client.patch(`/api/stage-slides/${slide.id}/`, {
        is_active: !slide.is_active,
      });
      setSlides(slides.map(s =>
        s.id === slide.id ? { ...s, is_active: !s.is_active } : s
      ));
    } catch (err) {
      setError(t('Error updating slide'));
    }
  };

  const handleMenuOpen = (event, slide) => {
    setMenuAnchor(event.currentTarget);
    setSelectedSlide(slide);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedSlide(null);
  };

  const filteredSlides = slides.filter(slide =>
    slide.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout title={t('Slides Management')}>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t('Slides Management')}
      breadcrumbs={[
        { label: t('Administration'), path: '/admin/dashboard' },
        { label: t('StageRunner'), path: '/admin/stagerunner' },
        { label: t('Slides') },
      ]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder={t('Search slides...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/admin/stagerunner/slides/new?config=${configId}`)}
        >
          {t('New Slide')}
        </Button>
      </Box>

      {/* Slides Grid */}
      {filteredSlides.length === 0 ? (
        <EmptyState
          message={search ? t('No slides found') : t('No slides. Create a new one to get started.')}
        />
      ) : (
        <Grid container spacing={2}>
          {filteredSlides.map((slide, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={slide.id}>
              <Card
                sx={{
                  height: '100%',
                  opacity: slide.is_active ? 1 : 0.6,
                  border: slide.is_active ? '2px solid' : '1px solid',
                  borderColor: slide.is_active ? 'primary.main' : 'divider',
                }}
              >
                {/* Slide Preview Area */}
                <Box
                  sx={{
                    height: 120,
                    bgcolor: slide.background_color || '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/admin/stagerunner/slides/${slide.id}?config=${configId}`)}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#fff',
                      textShadow: '0 0 10px rgba(0,0,0,0.5)',
                      textAlign: 'center',
                      px: 2,
                    }}
                  >
                    {slide.name}
                  </Typography>
                  <Chip
                    label={`#${index + 1}`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                    }}
                  />
                </Box>

                <CardContent sx={{ py: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t(slideTypeLabels[slide.slide_type] || slide.slide_type)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {effectLabels[slide.background_effect]} • {slide.element_count || 0} {t('Elements')}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleActive(slide)}
                        title={slide.is_active ? t('Deactivate') : t('Activate')}
                      >
                        {slide.is_active ? <ViewIcon fontSize="small" /> : <HideIcon fontSize="small" />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, slide)}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/admin/stagerunner/slides/${selectedSlide?.id}?config=${configId}`);
          handleMenuClose();
        }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{t('Edit')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleDuplicate(selectedSlide);
        }}>
          <ListItemIcon><DuplicateIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{t('Duplicate Slide')}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialog({ open: true, slide: selectedSlide });
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{t('Delete')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        title={t('Delete Slide')}
        message={t('Are you sure you want to delete the slide "{{name}}"? This action cannot be undone.', {
          name: deleteDialog.slide?.name,
        })}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, slide: null })}
      />
    </AdminLayout>
  );
};

export default SlidesListPage;
