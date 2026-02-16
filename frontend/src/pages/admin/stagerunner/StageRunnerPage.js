import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  IconButton,
} from '@mui/material';
import {
  Slideshow as SlideshowIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  OpenInNew as OpenInNewIcon,
  Layers as LayersIcon,
  SettingsRemote as ControlIcon,
  Theaters as TheatersIcon,
  Delete as DeleteIcon,
  EmojiEvents as AwardsIcon,
  Schedule as IdleIcon,
} from '@mui/icons-material';

import AdminLayout from '../../../components/admin/AdminLayout';
import { StatsCard } from '../../../components/admin/common';
import axiosWrapper from '../../../utils/AxiosWrapper';

const StageRunnerPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [editions, setEditions] = useState([]);
  const [selectedEdition, setSelectedEdition] = useState('');
  const [config, setConfig] = useState(null);
  const [presentations, setPresentations] = useState([]);
  const [compos, setCompos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Template dialog state
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedCompo, setSelectedCompo] = useState('');
  const [presentationName, setPresentationName] = useState('');
  const [creatingPresentation, setCreatingPresentation] = useState(false);

  // Add slide to presentation dialog
  const [addSlideDialogOpen, setAddSlideDialogOpen] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [selectedSlideToAdd, setSelectedSlideToAdd] = useState('');

  // Load editions
  useEffect(() => {
    const fetchEditions = async () => {
      try {
        const client = axiosWrapper();
        const response = await client.get('/api/editions/');
        setEditions(response.data.results || response.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading editions');
        setLoading(false);
      }
    };
    fetchEditions();
  }, []);

  // Load config when edition changes
  useEffect(() => {
    if (!selectedEdition) {
      setConfig(null);
      setPresentations([]);
      setCompos([]);
      return;
    }

    const fetchConfig = async () => {
      try {
        const client = axiosWrapper();
        const response = await client.get(`/api/stagerunner-config/?edition=${selectedEdition}`);
        const configs = response.data.results || response.data;
        if (configs.length > 0) {
          // Fetch detailed config
          const detailResponse = await client.get(`/api/stagerunner-config/${configs[0].id}/`);
          setConfig(detailResponse.data);
        } else {
          setConfig(null);
        }
      } catch (err) {
        setConfig(null);
      }
    };
    fetchConfig();
  }, [selectedEdition]);

  // Load presentations when config is available
  const fetchPresentations = useCallback(async () => {
    if (!config?.id) return;
    try {
      const client = axiosWrapper();
      const response = await client.get(`/api/stage-presentations/?config=${config.id}`);
      setPresentations(response.data.results || response.data);
    } catch (err) {
      console.error('Error loading presentations:', err);
    }
  }, [config?.id]);

  useEffect(() => {
    fetchPresentations();
  }, [fetchPresentations]);

  // Load compos for the edition
  useEffect(() => {
    if (!selectedEdition) {
      setCompos([]);
      return;
    }

    const fetchCompos = async () => {
      try {
        const client = axiosWrapper();
        const response = await client.get(`/api/hascompos/?edition=${selectedEdition}`);
        setCompos(response.data.results || response.data);
      } catch (err) {
        console.error('Error loading compos:', err);
      }
    };
    fetchCompos();
  }, [selectedEdition]);

  const handleCreateConfig = async () => {
    try {
      const client = axiosWrapper();
      const response = await client.post('/api/stagerunner-config/', {
        edition: selectedEdition,
        default_background_effect: 'hyperspace',
      });
      setConfig(response.data);
    } catch (err) {
      setError('Error creating configuration');
    }
  };

  const handleOpenBeamer = () => {
    if (selectedEdition) {
      window.open(`/app/stagerunner/${selectedEdition}`, '_blank');
    }
  };

  const handleOpenTemplateDialog = (template) => {
    setSelectedTemplate(template);
    setSelectedCompo('');
    setPresentationName(template === 'idle' ? t('Idle Presentation') : '');
    setTemplateDialogOpen(true);
  };

  const handleCloseTemplateDialog = () => {
    setTemplateDialogOpen(false);
    setSelectedTemplate('');
    setSelectedCompo('');
    setPresentationName('');
  };

  const handleCreateFromTemplate = async () => {
    if (!config?.id || !presentationName) return;
    if ((selectedTemplate === 'compo_presentation' || selectedTemplate === 'awards_ceremony') && !selectedCompo) return;

    setCreatingPresentation(true);
    try {
      const client = axiosWrapper();
      const data = {
        config_id: config.id,
        template_type: selectedTemplate,
        name: presentationName,
      };
      if (selectedCompo) {
        data.has_compo_id = selectedCompo;
      }
      await client.post('/api/stage-presentations/from-template/', data);
      await fetchPresentations();
      handleCloseTemplateDialog();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating presentation');
    } finally {
      setCreatingPresentation(false);
    }
  };

  const handleDeletePresentation = async (presentationId) => {
    try {
      const client = axiosWrapper();
      await client.delete(`/api/stage-presentations/${presentationId}/`);
      fetchPresentations();
    } catch (err) {
      setError('Error deleting presentation');
    }
  };

  // Add slide to presentation
  const handleOpenAddSlideDialog = (presentation) => {
    setSelectedPresentation(presentation);
    setSelectedSlideToAdd('');
    setAddSlideDialogOpen(true);
  };

  const handleAddSlideToPresentation = async () => {
    if (!selectedPresentation || !selectedSlideToAdd) return;
    try {
      const client = axiosWrapper();
      await client.post(`/api/stage-presentations/${selectedPresentation.id}/add-slide/`, {
        slide_id: selectedSlideToAdd,
        display_order: selectedPresentation.slides?.length || 0,
      });
      setAddSlideDialogOpen(false);
      fetchPresentations();
    } catch (err) {
      setError('Error adding slide to presentation');
    }
  };

  // Remove slide from presentation
  const handleRemoveSlideFromPresentation = async (presentationId, slideId) => {
    try {
      const client = axiosWrapper();
      await client.post(`/api/stage-presentations/${presentationId}/remove-slide/`, {
        slide_id: slideId,
      });
      fetchPresentations();
    } catch (err) {
      setError('Error removing slide from presentation');
    }
  };

  // Get slides not in presentation (for add dialog)
  const getAvailableSlides = () => {
    if (!config?.slides || !selectedPresentation) return [];
    const presentationSlideIds = selectedPresentation.slides?.map(s => s.id) || [];
    return config.slides.filter(s => !presentationSlideIds.includes(s.id));
  };

  const effectLabels = {
    hyperspace: 'Hyperspace',
    wave: 'Wave',
    'energy-grid': 'Energy Grid',
    'tron-grid': 'Tron Grid',
    none: 'None',
  };

  return (
    <AdminLayout
      title={t('StageRunner Dashboard')}
      breadcrumbs={[
        { label: t('Administration'), path: '/admin/dashboard' },
        { label: t('StageRunner') },
      ]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Edition Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('Edition')}</InputLabel>
                <Select
                  value={selectedEdition}
                  onChange={(e) => setSelectedEdition(e.target.value)}
                  label={t('Edition')}
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
              {selectedEdition && config && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<OpenInNewIcon />}
                  onClick={handleOpenBeamer}
                  size="large"
                >
                  {t('Open Beamer')}
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* No edition selected */}
      {!selectedEdition && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <SlideshowIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {t('No Edition Selected')}
            </Typography>
            <Typography color="text.secondary">
              {t('Select an edition to configure StageRunner')}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Edition selected but no config */}
      {selectedEdition && !config && !loading && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <SettingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('No StageRunner configuration for this edition')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateConfig}
              sx={{ mt: 2 }}
            >
              {t('Create Configuration')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Config exists - show dashboard */}
      {selectedEdition && config && (
        <>
          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('Slides')}
                value={config.slides?.length || 0}
                icon={<LayersIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('Active')}
                value={config.slides?.filter(s => s.is_active).length || 0}
                icon={<PlayIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('Background Effect')}
                value={effectLabels[config.default_background_effect] || config.default_background_effect}
                icon={<SlideshowIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('Canvas')}
                value={`${config.canvas_width}x${config.canvas_height}`}
                icon={<SettingsIcon />}
              />
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('Quick Actions')}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/admin/stagerunner/slides/new?config=${config.id}`)}
                  >
                    {t('New Slide')}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<LayersIcon />}
                    onClick={() => navigate(`/admin/stagerunner/slides?config=${config.id}`)}
                  >
                    {t('Manage Slides')}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<ControlIcon />}
                    onClick={() => navigate(`/admin/stagerunner/control?config=${config.id}`)}
                  >
                    {t('Live Control')}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<OpenInNewIcon />}
                    onClick={handleOpenBeamer}
                  >
                    {t('Open Beamer')}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Presentations */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('Presentations')}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {/* Template buttons */}
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('Create from Template')}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<IdleIcon />}
                    onClick={() => handleOpenTemplateDialog('idle')}
                  >
                    {t('Idle / All Day')}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<TheatersIcon />}
                    onClick={() => handleOpenTemplateDialog('compo_presentation')}
                    disabled={compos.length === 0}
                  >
                    {t('Compo Presentation')}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<AwardsIcon />}
                    onClick={() => handleOpenTemplateDialog('awards_ceremony')}
                    disabled={compos.length === 0}
                  >
                    {t('Awards Ceremony')}
                  </Button>
                </Grid>
              </Grid>

              {/* Existing presentations */}
              {presentations.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  {t('No presentations created yet. Create one from a template above.')}
                </Typography>
              ) : (
                <List>
                  {presentations.map((pres) => (
                    <ListItem
                      key={pres.id}
                      divider
                      sx={{
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        py: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {pres.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                            <Chip
                              label={
                                pres.presentation_type === 'compo' ? t('Compo') :
                                pres.presentation_type === 'awards' ? t('Awards') :
                                pres.presentation_type === 'idle' ? t('Idle') :
                                pres.presentation_type
                              }
                              size="small"
                              color={
                                pres.presentation_type === 'compo' ? 'primary' :
                                pres.presentation_type === 'awards' ? 'warning' :
                                'default'
                              }
                            />
                            <Chip
                              label={`${pres.slide_count || 0} slides`}
                              size="small"
                              variant="outlined"
                            />
                            {pres.has_compo_name && (
                              <Chip
                                label={pres.has_compo_name}
                                size="small"
                                variant="outlined"
                                color="info"
                              />
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ControlIcon />}
                            onClick={() => navigate(`/admin/stagerunner/control?config=${config.id}&presentation=${pres.id}`)}
                          >
                            {t('Use')}
                          </Button>
                          <IconButton
                            color="error"
                            onClick={() => handleDeletePresentation(pres.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Show slides in this presentation */}
                      <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {t('Slides')}:
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenAddSlideDialog(pres)}
                          >
                            {t('Add Slide')}
                          </Button>
                        </Box>
                        {pres.slides && pres.slides.length > 0 ? (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {pres.slides.map((slide, index) => (
                              <Chip
                                key={slide.id}
                                label={`${index + 1}. ${slide.name}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                onClick={() => navigate(`/admin/stagerunner/slides/${slide.id}?config=${config.id}`)}
                                onDelete={() => handleRemoveSlideFromPresentation(pres.id, slide.id)}
                                sx={{
                                  cursor: 'pointer',
                                  '&:hover': {
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {t('No slides. Add slides to this presentation.')}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Recent Slides */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('Slides')}
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate(`/admin/stagerunner/slides?config=${config.id}`)}
                >
                  {t('View All')}
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {config.slides?.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    {t('No slides. Create a new one to get started.')}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {config.slides?.slice(0, 6).map((slide) => (
                    <Grid item xs={12} sm={6} md={4} key={slide.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { borderColor: 'primary.main' },
                        }}
                        onClick={() => navigate(`/admin/stagerunner/slides/${slide.id}?config=${config.id}`)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle1" noWrap>
                              {slide.name}
                            </Typography>
                            {slide.is_active ? (
                              <Chip label={t('Active')} color="success" size="small" />
                            ) : (
                              <Chip label={t('Inactive')} size="small" />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {t(slide.slide_type === 'custom' ? 'Custom Layout' : slide.slide_type)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {slide.element_count || 0} {t('Elements')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onClose={handleCloseTemplateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTemplate === 'idle' && t('Create Idle Presentation')}
          {selectedTemplate === 'compo_presentation' && t('Create Compo Presentation')}
          {selectedTemplate === 'awards_ceremony' && t('Create Awards Ceremony')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('Presentation Name')}
            fullWidth
            value={presentationName}
            onChange={(e) => setPresentationName(e.target.value)}
            sx={{ mb: 2 }}
          />

          {(selectedTemplate === 'compo_presentation' || selectedTemplate === 'awards_ceremony') && (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>{t('Competition')}</InputLabel>
              <Select
                value={selectedCompo}
                onChange={(e) => {
                  setSelectedCompo(e.target.value);
                  const compo = compos.find(c => c.id === e.target.value);
                  if (compo && !presentationName) {
                    setPresentationName(compo.compo_name + (selectedTemplate === 'awards_ceremony' ? ' - Results' : ''));
                  }
                }}
                label={t('Competition')}
              >
                {compos.map((hc) => (
                  <MenuItem key={hc.id} value={hc.id}>
                    {hc.compo_name || hc.compo?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            {selectedTemplate === 'idle' && t('Creates a presentation with logo, clock, and sponsors slides.')}
            {selectedTemplate === 'compo_presentation' && t('Creates an intro slide, production list, and production show template.')}
            {selectedTemplate === 'awards_ceremony' && t('Creates an intro slide, results table with reveal, and podium.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTemplateDialog}>
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateFromTemplate}
            disabled={!presentationName || creatingPresentation || ((selectedTemplate === 'compo_presentation' || selectedTemplate === 'awards_ceremony') && !selectedCompo)}
          >
            {creatingPresentation ? t('Creating...') : t('Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Slide to Presentation Dialog */}
      <Dialog open={addSlideDialogOpen} onClose={() => setAddSlideDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('Add Slide to')} {selectedPresentation?.name}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>{t('Select Slide')}</InputLabel>
            <Select
              value={selectedSlideToAdd}
              onChange={(e) => setSelectedSlideToAdd(e.target.value)}
              label={t('Select Slide')}
            >
              {getAvailableSlides().map((slide) => (
                <MenuItem key={slide.id} value={slide.id}>
                  {slide.name} ({slide.slide_type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {getAvailableSlides().length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('All slides are already in this presentation. Create a new slide first.')}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSlideDialogOpen(false)}>
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleAddSlideToPresentation}
            disabled={!selectedSlideToAdd}
          >
            {t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default StageRunnerPage;
