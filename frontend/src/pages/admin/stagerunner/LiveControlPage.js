import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Divider,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  LinearProgress,
  Paper,
  Tooltip,
  ButtonGroup,
  Stack,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
  FirstPage as FirstIcon,
  LastPage as LastIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  EmojiEvents as TrophyIcon,
  Movie as MovieIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

import AdminLayout from '../../../components/admin/AdminLayout';
import axiosWrapper from '../../../utils/AxiosWrapper';

const LiveControlPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const configId = searchParams.get('config');

  const [config, setConfig] = useState(null);
  const [control, setControl] = useState(null);
  const [presentations, setPresentations] = useState([]);
  const [compoData, setCompoData] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Current state derived from control
  const currentSlideIndex = control?.current_slide_index || 0;
  const currentProductionIndex = control?.current_production_index || 0;
  const revealedPositions = control?.revealed_positions || 0;
  const isPlaying = control?.is_playing || false;

  // Get active slides
  const slides = config?.slides?.filter(s => s.is_active) || [];
  const currentSlide = slides[currentSlideIndex];

  // Fetch initial data
  const fetchData = useCallback(async () => {
    if (!configId) return;

    try {
      const client = axiosWrapper();

      // Fetch config with full state
      const configResponse = await client.get(`/api/stagerunner-config/${configId}/full-state/`);
      setConfig(configResponse.data);

      // Fetch presentations
      const presentationsResponse = await client.get(`/api/stage-presentations/?config=${configId}`);
      setPresentations(presentationsResponse.data.results || presentationsResponse.data);

      // Fetch control state
      const controlResponse = await client.get(`/api/stage-control/by-config/?config=${configId}`);
      setControl(controlResponse.data);

      setLoading(false);
    } catch (err) {
      setError('Error loading StageRunner data');
      setLoading(false);
    }
  }, [configId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch compo data when slide has a compo
  useEffect(() => {
    if (!currentSlide?.has_compo) {
      setCompoData(null);
      setResultsData(null);
      return;
    }

    const fetchCompoData = async () => {
      try {
        const client = axiosWrapper();
        const response = await client.get(`/api/stagerunner-data/compo/${currentSlide.has_compo}/`);
        setCompoData(response.data);

        // Also fetch results if it's a results slide
        if (['results_live', 'results_final', 'podium'].includes(currentSlide.slide_type)) {
          const resultsResponse = await client.get(`/api/stagerunner-data/results/${currentSlide.has_compo}/`);
          setResultsData(resultsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching compo data:', err);
      }
    };

    fetchCompoData();
  }, [currentSlide?.has_compo, currentSlide?.slide_type]);

  // Poll for control state updates
  useEffect(() => {
    if (!configId) return;

    const pollControl = async () => {
      try {
        const client = axiosWrapper();
        const response = await client.get(`/api/stage-control/by-config/?config=${configId}`);
        setControl(response.data);
      } catch (err) {
        // Silent fail for polling
      }
    };

    const interval = setInterval(pollControl, 2000);
    return () => clearInterval(interval);
  }, [configId]);

  // Send command to API
  const sendCommand = async (action, data = {}) => {
    if (!control?.id) return;

    setSyncing(true);
    try {
      const client = axiosWrapper();
      const response = await client.post(`/api/stage-control/${control.id}/${action}/`, data);
      setControl(response.data);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Navigation handlers
  const handleNextSlide = () => sendCommand('next');
  const handlePrevSlide = () => sendCommand('previous');
  const handleTogglePlay = () => sendCommand('toggle-play');

  const handleGoToSlide = async (slideId, index) => {
    setSyncing(true);
    try {
      const client = axiosWrapper();
      // Navigate to specific slide with index
      const response = await client.post(`/api/stage-control/${control.id}/navigate/`, {
        slide_id: slideId,
        slide_index: index,
      });
      setControl(response.data);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Production navigation
  const updateProductionIndex = async (index, command) => {
    if (!control?.id) return;
    setSyncing(true);
    try {
      const client = axiosWrapper();
      const response = await client.patch(`/api/stage-control/${control.id}/`, {
        current_production_index: index,
        command: command,
      });
      setControl(response.data);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleNextProduction = () => {
    if (currentProductionIndex < (compoData?.productions?.length || 0) - 1) {
      updateProductionIndex(currentProductionIndex + 1, 'next_production');
    }
  };

  const handlePrevProduction = () => {
    if (currentProductionIndex > 0) {
      updateProductionIndex(currentProductionIndex - 1, 'prev_production');
    }
  };

  const handleGoToProduction = (index) => {
    updateProductionIndex(index, 'next_production');
  };

  // Results revelation
  const handleRevealNext = () => sendCommand('reveal-next');
  const handleResetReveal = () => sendCommand('reset-reveal');

  const handleRevealAll = async () => {
    if (!control?.id || !resultsData) return;
    setSyncing(true);
    try {
      const client = axiosWrapper();
      await client.patch(`/api/stage-control/${control.id}/`, {
        revealed_positions: resultsData.results.length,
        command: 'reveal_all',
      });
      setControl(prev => ({
        ...prev,
        revealed_positions: resultsData.results.length,
      }));
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Presentation selection
  const handleSelectPresentation = async (presentationId) => {
    if (!control?.id) return;
    await sendCommand('set-presentation', { presentation_id: presentationId });
    fetchData(); // Refresh to get new slides
  };

  // Open beamer
  const handleOpenBeamer = () => {
    if (config?.edition) {
      window.open(`/app/stagerunner/${config.edition}`, '_blank');
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t('Live Control')}>
        <LinearProgress />
      </AdminLayout>
    );
  }

  if (!configId || !config) {
    return (
      <AdminLayout title={t('Live Control')}>
        <Alert severity="warning">{t('No configuration selected')}</Alert>
      </AdminLayout>
    );
  }

  const productions = compoData?.productions || [];
  const currentProduction = productions[currentProductionIndex];
  const isResultsSlide = ['results_live', 'results_final', 'podium'].includes(currentSlide?.slide_type);
  const isProductionSlide = currentSlide?.slide_type === 'production_show' || currentSlide?.slide_type === 'production_list';

  return (
    <AdminLayout
      title={t('Live Control')}
      breadcrumbs={[
        { label: t('Administration'), path: '/admin/dashboard' },
        { label: t('StageRunner'), path: '/admin/stagerunner' },
        { label: t('Live Control') },
      ]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {syncing && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {/* Left Column - Presentations & Slides */}
        <Grid item xs={12} md={4}>
          {/* Presentations */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('Presentations')}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {presentations.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  {t('No presentations created')}
                </Typography>
              ) : (
                <List dense>
                  {presentations.map((pres) => (
                    <ListItemButton
                      key={pres.id}
                      selected={control?.current_presentation === pres.id}
                      onClick={() => handleSelectPresentation(pres.id)}
                    >
                      <ListItemText
                        primary={pres.name}
                        secondary={`${pres.presentation_type} - ${pres.slide_count} slides`}
                      />
                      {control?.current_presentation === pres.id && (
                        <Chip label={t('Active')} color="primary" size="small" />
                      )}
                    </ListItemButton>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Slides List */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">
                  {t('Slides')}
                </Typography>
                <Chip
                  label={`${currentSlideIndex + 1} / ${slides.length}`}
                  color="primary"
                  size="small"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />

              <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {slides.map((slide, index) => (
                  <ListItemButton
                    key={slide.id}
                    selected={index === currentSlideIndex}
                    onClick={() => handleGoToSlide(slide.id, index)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {index + 1}.
                          </Typography>
                          {slide.name}
                        </Box>
                      }
                      secondary={slide.slide_type}
                    />
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Center Column - Preview & Controls */}
        <Grid item xs={12} md={5}>
          {/* Preview */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('Preview')}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Tooltip title={t('Refresh')}>
                    <IconButton size="small" onClick={fetchData}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('Open Beamer')}>
                    <IconButton size="small" onClick={handleOpenBeamer}>
                      <OpenInNewIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              {/* Mini Preview */}
              <Paper
                sx={{
                  width: '100%',
                  paddingTop: '56.25%', // 16:9 aspect ratio
                  position: 'relative',
                  bgcolor: currentSlide?.background_color || '#000',
                  borderRadius: 1,
                  overflow: 'hidden',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    textAlign: 'center',
                    p: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {currentSlide?.name || 'No slide'}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    {currentSlide?.slide_type}
                  </Typography>
                  {isProductionSlide && currentProduction && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1">
                        {currentProduction.title}
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.5)">
                        {currentProduction.authors}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Slide Info */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('Slide')}: {currentSlideIndex + 1} / {slides.length}
                </Typography>
                {isProductionSlide && productions.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {t('Production')}: {currentProductionIndex + 1} / {productions.length}
                  </Typography>
                )}
                {isResultsSlide && resultsData && (
                  <Typography variant="body2" color="text.secondary">
                    {t('Revealed')}: {revealedPositions} / {resultsData.results.length}
                  </Typography>
                )}
              </Box>

              {/* Main Controls */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <ButtonGroup variant="contained" size="large">
                  <Tooltip title={t('First Slide')}>
                    <Button onClick={() => handleGoToSlide(slides[0]?.id, 0)} disabled={currentSlideIndex === 0}>
                      <FirstIcon />
                    </Button>
                  </Tooltip>
                  <Tooltip title={t('Previous')}>
                    <Button onClick={handlePrevSlide} disabled={currentSlideIndex === 0}>
                      <PrevIcon />
                    </Button>
                  </Tooltip>
                  <Tooltip title={isPlaying ? t('Pause') : t('Play')}>
                    <Button onClick={handleTogglePlay} color={isPlaying ? 'warning' : 'primary'}>
                      {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </Button>
                  </Tooltip>
                  <Tooltip title={t('Next')}>
                    <Button onClick={handleNextSlide} disabled={currentSlideIndex >= slides.length - 1}>
                      <NextIcon />
                    </Button>
                  </Tooltip>
                  <Tooltip title={t('Last Slide')}>
                    <Button onClick={() => handleGoToSlide(slides[slides.length - 1]?.id, slides.length - 1)} disabled={currentSlideIndex >= slides.length - 1}>
                      <LastIcon />
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </Box>

              {/* Production Controls */}
              {isProductionSlide && productions.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('Production Navigation')}
                  </Typography>
                  <ButtonGroup variant="outlined" fullWidth>
                    <Button
                      onClick={handlePrevProduction}
                      disabled={currentProductionIndex === 0}
                      startIcon={<PrevIcon />}
                    >
                      {t('Prev')}
                    </Button>
                    <Button
                      onClick={handleNextProduction}
                      disabled={currentProductionIndex >= productions.length - 1}
                      endIcon={<NextIcon />}
                    >
                      {t('Next')}
                    </Button>
                  </ButtonGroup>
                </Box>
              )}

              {/* Results Reveal Controls */}
              {isResultsSlide && resultsData && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrophyIcon fontSize="small" color="warning" />
                    {t('Results Revelation')}
                  </Typography>
                  <Stack spacing={1}>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleRevealNext}
                      disabled={revealedPositions >= resultsData.results.length}
                      startIcon={<VisibilityIcon />}
                      fullWidth
                    >
                      {t('Reveal Next')} ({resultsData.results.length - revealedPositions} {t('remaining')})
                    </Button>
                    <ButtonGroup fullWidth>
                      <Button
                        variant="outlined"
                        onClick={handleRevealAll}
                        startIcon={<VisibilityIcon />}
                      >
                        {t('Reveal All')}
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleResetReveal}
                        startIcon={<VisibilityOffIcon />}
                      >
                        {t('Reset')}
                      </Button>
                    </ButtonGroup>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Productions / Results */}
        <Grid item xs={12} md={3}>
          {/* Productions List */}
          {isProductionSlide && productions.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('Productions')}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {productions.map((prod, index) => (
                    <ListItemButton
                      key={prod.id}
                      selected={index === currentProductionIndex}
                      onClick={() => handleGoToProduction(index)}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={index + 1}
                              size="small"
                              color={index === currentProductionIndex ? 'primary' : 'default'}
                            />
                            <Typography variant="body2" noWrap>
                              {prod.title}
                            </Typography>
                          </Box>
                        }
                        secondary={prod.authors}
                      />
                      {prod.video_url && (
                        <Tooltip title={t('Has Video')}>
                          <MovieIcon fontSize="small" color="action" />
                        </Tooltip>
                      )}
                    </ListItemButton>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Results List */}
          {isResultsSlide && resultsData && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('Results')} - {resultsData.compo?.name}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {resultsData.results.map((result, index) => {
                    const isRevealed = index >= resultsData.results.length - revealedPositions;
                    return (
                      <ListItem
                        key={result.production.id}
                        sx={{
                          bgcolor: isRevealed ? 'action.selected' : 'transparent',
                          borderRadius: 1,
                          mb: 0.5,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={`#${result.position}`}
                                size="small"
                                color={
                                  result.position === 1 ? 'warning' :
                                  result.position === 2 ? 'default' :
                                  result.position === 3 ? 'default' : 'default'
                                }
                                sx={{
                                  bgcolor: result.position === 1 ? '#ffd700' :
                                          result.position === 2 ? '#c0c0c0' :
                                          result.position === 3 ? '#cd7f32' : undefined,
                                }}
                              />
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ opacity: isRevealed ? 1 : 0.3 }}
                              >
                                {isRevealed ? result.production.title : '???'}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            isRevealed ? (
                              <Typography variant="caption">
                                {result.score.toFixed(1)} pts
                              </Typography>
                            ) : null
                          }
                        />
                        {isRevealed ? (
                          <VisibilityIcon fontSize="small" color="success" />
                        ) : (
                          <VisibilityOffIcon fontSize="small" color="disabled" />
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Quick Info */}
          {!isProductionSlide && !isResultsSlide && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('Slide Info')}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>{t('Type')}:</strong> {currentSlide?.slide_type}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>{t('Effect')}:</strong> {currentSlide?.background_effect}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>{t('Elements')}:</strong> {currentSlide?.elements?.length || 0}
                </Typography>
                {currentSlide?.has_compo_name && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>{t('Compo')}:</strong> {currentSlide.has_compo_name}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default LiveControlPage;
