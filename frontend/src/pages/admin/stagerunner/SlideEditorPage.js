import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Slider,
  LinearProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  Visibility as VisibleIcon,
  VisibilityOff as HiddenIcon,
  OpenInNew as OpenInNewIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AccessTime as ClockIcon,
  Timer as TimerIcon,
  ViewCarousel as ProductionIcon,
  Handshake as SponsorIcon,
  TextRotationNone as ScrollTextIcon,
  CloudUpload as UploadIcon,
  Clear as ClearIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
} from '@mui/icons-material';
import { Rnd } from 'react-rnd';
import { HexColorPicker } from 'react-colorful';

import axiosWrapper from '../../../utils/AxiosWrapper';
import ThreeBackground from '../../../components/common/ThreeBackground';
import WebGL2Background from '../../../components/common/WebGL2Background';
import { ClockRenderer, CountdownRenderer } from '../../../components/stagerunner/renderers';
import { getVideoEmbedUrl, isVideoUrl } from '../../../utils/videoUtils';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const slideTypeOptions = [
  { value: 'custom', label: 'Custom Layout' },
  { value: 'idle', label: 'Idle/Waiting' },
  { value: 'countdown', label: 'Countdown' },
  { value: 'production_list', label: 'Production List' },
  { value: 'production_show', label: 'Production Show' },
  { value: 'results', label: 'Results' },
];

const backgroundEffectOptions = [
  { value: 'inherit', label: 'Use Default' },
  { value: 'hyperspace', label: 'Hyperspace' },
  { value: 'wave', label: 'Wave' },
  { value: 'energy-grid', label: 'Energy Grid' },
  { value: 'tron-grid', label: 'Tron Grid' },
  { value: 'floating-spheres', label: 'Floating Spheres' },
  { value: 'spinning-toroids', label: 'Spinning Toroids' },
  { value: 'crystal-pyramids', label: 'Crystal Pyramids' },
  { value: 'infinite-tunnel', label: 'Infinite Tunnel' },
  { value: 'wuhu-boxes', label: 'Wuhu Boxes' },
  { value: 'wuhu-boxes-fire', label: 'Wuhu Boxes Fire' },
  { value: 'wuhu-boxes-purple', label: 'Wuhu Boxes Purple' },
  { value: 'none', label: 'None' },
];

const webgl2Effects = ['wuhu-boxes', 'wuhu-boxes-fire', 'wuhu-boxes-purple'];
const threeEffects = ['hyperspace', 'wave', 'energy-grid', 'tron-grid', 'floating-spheres', 'spinning-toroids', 'crystal-pyramids', 'infinite-tunnel'];
const effectIndexMap = { hyperspace: 0, wave: 1, 'energy-grid': 2, 'tron-grid': 3, 'floating-spheres': 4, 'spinning-toroids': 5, 'crystal-pyramids': 6, 'infinite-tunnel': 7 };

const elementTypes = [
  { type: 'text', label: 'Text', icon: TextIcon },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'video', label: 'Video', icon: VideoIcon },
  { type: 'scrolling_text', label: 'Scrolling Text', icon: ScrollTextIcon },
  { type: 'clock', label: 'Clock', icon: ClockIcon },
  { type: 'countdown', label: 'Countdown Timer', icon: TimerIcon },
  { type: 'production_info', label: 'Production Info', icon: ProductionIcon },
  { type: 'sponsor_bar', label: 'Sponsor Bar', icon: SponsorIcon },
];

const transitionOptions = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide_left', label: 'Slide from Left' },
  { value: 'slide_right', label: 'Slide from Right' },
  { value: 'slide_up', label: 'Slide from Bottom' },
  { value: 'slide_down', label: 'Slide from Top' },
  { value: 'zoom', label: 'Zoom In' },
  { value: 'bounce', label: 'Bounce' },
];

const SlideEditorPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const urlConfigId = searchParams.get('config');
  const isNew = !id || id === 'new';

  const [slide, setSlide] = useState({
    name: '',
    slide_type: 'custom',
    background_effect: 'inherit',
    background_color: '#000000',
    is_active: true,
    duration: 0,
    config: null,
  });
  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [canvasScale, setCanvasScale] = useState(0.5);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateSlide = (updates) => {
    setSlide(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  // Get config ID from URL or from loaded slide
  const configId = urlConfigId || slide.config;

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Calculate canvas scale based on container
  useEffect(() => {
    const updateScale = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        const containerWidth = container.offsetWidth - 40;
        const scale = Math.min(containerWidth / CANVAS_WIDTH, 0.6);
        setCanvasScale(scale);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Load slide data
  useEffect(() => {
    if (!isNew && id) {
      fetchSlide();
    }
  }, [id, isNew]);

  const fetchSlide = async () => {
    try {
      const client = axiosWrapper();
      const response = await client.get(`/api/stage-slides/${id}/`);
      setSlide(response.data);
      setElements(response.data.elements || []);
      setLoading(false);
    } catch (err) {
      setError('Error loading slide');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!slide.name.trim()) {
      setError(t('Slide name is required'));
      return;
    }

    if (isNew && !configId) {
      setError(t('Configuration is required'));
      return;
    }

    setSaving(true);
    try {
      const client = axiosWrapper();
      let slideId = id;

      // Save slide
      if (isNew) {
        const response = await client.post('/api/stage-slides/', {
          ...slide,
          config: configId,
        });
        slideId = response.data.id;
      } else {
        await client.put(`/api/stage-slides/${id}/`, slide);
      }

      // Save elements
      for (const element of elements) {
        const hasFiles = element._imageFile || element._videoFile;
        const { _isNew, _imageFile, _videoFile, _imagePreview, _videoPreview, ...cleanElement } = element;

        if (hasFiles) {
          const formData = new FormData();
          const elementData = { ...cleanElement, slide: slideId };
          // Remove fields that shouldn't go in FormData
          delete elementData.image;
          delete elementData.video;
          delete elementData.created;
          delete elementData.modified;

          Object.entries(elementData).forEach(([key, value]) => {
            if (value === null || value === undefined) return;
            if (key === 'styles' && typeof value === 'object') {
              formData.append(key, JSON.stringify(value));
            } else if (typeof value === 'boolean') {
              formData.append(key, value ? 'true' : 'false');
            } else {
              formData.append(key, value);
            }
          });
          if (_imageFile) formData.append('image', _imageFile);
          if (_videoFile) formData.append('video', _videoFile);

          const uploadConfig = {
            timeout: 600000,
            onUploadProgress: (progressEvent) => {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress({ element: element.name, percent });
            },
          };
          if (element.id && !_isNew) {
            await client.put(`/api/slide-elements/${element.id}/`, formData, uploadConfig);
          } else {
            formData.delete('id');
            await client.post('/api/slide-elements/', formData, uploadConfig);
          }
          setUploadProgress(null);
        } else {
          // Remove file URL strings - backend expects files, not URLs
          const { image, video, created, modified, ...jsonElement } = cleanElement;
          if (element.id && !_isNew) {
            await client.put(`/api/slide-elements/${element.id}/`, {
              ...jsonElement,
              slide: slideId,
            });
          } else {
            const { id: _, ...elementData } = jsonElement;
            await client.post('/api/slide-elements/', {
              ...elementData,
              slide: slideId,
            });
          }
        }
      }

      setHasUnsavedChanges(false);

      // Check if any element has a video that needs conversion
      const hasVideoUploads = elements.some(el => el._videoFile);

      // Reload slide data from server
      if (isNew) {
        // Navigate to the saved slide's edit page
        navigate(`/admin/stagerunner/slides/${slideId}?config=${configId}`, { replace: true });
      } else {
        // Reload data in place
        const reloadResponse = await client.get(`/api/stage-slides/${id}/`);
        setSlide(reloadResponse.data);
        setElements(reloadResponse.data.elements || []);
      }

      setSaving(false);

      if (hasVideoUploads) {
        // Poll for video conversion completion
        setUploadProgress({ element: t('Converting video...'), percent: -1 });
        const pollConversion = async () => {
          const pollClient = axiosWrapper();
          const sid = isNew ? slideId : id;
          for (let i = 0; i < 120; i++) { // Max 10 minutes (120 * 5s)
            await new Promise(r => setTimeout(r, 5000));
            try {
              const res = await pollClient.get(`/api/stage-slides/${sid}/`);
              const videoElements = res.data.elements?.filter(el => el.element_type === 'video' && el.video) || [];
              // Try to probe if videos are playable
              const allReady = await Promise.all(videoElements.map(el => {
                return new Promise(resolve => {
                  const video = document.createElement('video');
                  video.preload = 'metadata';
                  video.onloadedmetadata = () => { video.remove(); resolve(true); };
                  video.onerror = () => { video.remove(); resolve(false); };
                  video.src = el.video.startsWith('http') ? el.video : `${process.env.REACT_APP_BACKEND_ADDRESS || 'http://localhost:8000'}${el.video}`;
                  setTimeout(() => { video.remove(); resolve(false); }, 10000);
                });
              }));
              if (allReady.every(Boolean) || videoElements.length === 0) {
                // Reload with converted videos
                setSlide(res.data);
                setElements(res.data.elements || []);
                setUploadProgress(null);
                return;
              }
              setUploadProgress({ element: t('Converting video...'), percent: Math.min(95, Math.round((i / 120) * 100)) });
            } catch { break; }
          }
          setUploadProgress(null);
        };
        pollConversion();
      }

      return;
    } catch (err) {
      console.error('Error saving slide:', err.response?.data || err.message || err);
      const detail = err.response?.data
        ? (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data)
        : err.message;
      setError(`Error: ${detail}`);
      setUploadProgress(null);
      setSaving(false);
    }
  };

  const addElement = (type) => {
    const newElement = {
      id: `new-${Date.now()}`,
      _isNew: true,
      element_type: type,
      name: `${type} ${elements.length + 1}`,
      x: 10,
      y: 10,
      width: 30,
      height: 15,
      rotation: 0,
      z_index: elements.length,
      content: type === 'text' ? 'Sample Text' : '',
      styles: {
        fontSize: 48,
        fontFamily: 'Arial',
        color: '#ffffff',
        textAlign: 'center',
      },
      enter_transition: 'fade',
      exit_transition: 'fade',
      enter_duration: 500,
      exit_duration: 500,
      enter_delay: 0,
      is_visible: true,
    };
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
    setHasUnsavedChanges(true);
  };

  const updateElement = (elementId, updates) => {
    setHasUnsavedChanges(true);
    setElements(elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  const moveLayer = (elementId, direction) => {
    // Sort ascending by z_index, then renormalize to 0..n-1 to avoid duplicates
    const sorted = [...elements].sort((a, b) => (a.z_index || 0) - (b.z_index || 0));
    const idx = sorted.findIndex(el => el.id === elementId);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    // Swap positions
    [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx], sorted[idx]];

    // Reassign z_index sequentially
    const updates = {};
    sorted.forEach((el, i) => { updates[el.id] = i; });
    setElements(elements.map(el => ({ ...el, z_index: updates[el.id] })));
    setHasUnsavedChanges(true);
  };

  const deleteElement = async (elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (element && !element._isNew) {
      try {
        const client = axiosWrapper();
        await client.delete(`/api/slide-elements/${elementId}/`);
      } catch (err) {
        setError('Error deleting element');
        return;
      }
    }
    setElements(elements.filter(el => el.id !== elementId));
    setHasUnsavedChanges(true);
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  };

  const selectedElement = elements.find(el => el.id === selectedElementId);

  const renderElement = (element) => {
    const isSelected = element.id === selectedElementId;
    const ElementIcon = elementTypes.find(t => t.type === element.element_type)?.icon || TextIcon;

    return (
      <Rnd
        key={element.id}
        size={{
          width: (element.width / 100) * CANVAS_WIDTH * canvasScale,
          height: (element.height / 100) * CANVAS_HEIGHT * canvasScale,
        }}
        position={{
          x: (element.x / 100) * CANVAS_WIDTH * canvasScale,
          y: (element.y / 100) * CANVAS_HEIGHT * canvasScale,
        }}
        onDragStop={(e, d) => {
          const newX = (d.x / (CANVAS_WIDTH * canvasScale)) * 100;
          const newY = (d.y / (CANVAS_HEIGHT * canvasScale)) * 100;
          updateElement(element.id, { x: newX, y: newY });
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          const newWidth = (parseFloat(ref.style.width) / (CANVAS_WIDTH * canvasScale)) * 100;
          const newHeight = (parseFloat(ref.style.height) / (CANVAS_HEIGHT * canvasScale)) * 100;
          const newX = (position.x / (CANVAS_WIDTH * canvasScale)) * 100;
          const newY = (position.y / (CANVAS_HEIGHT * canvasScale)) * 100;
          updateElement(element.id, {
            width: newWidth,
            height: newHeight,
            x: newX,
            y: newY,
          });
        }}
        onClick={() => setSelectedElementId(element.id)}
        style={{
          zIndex: element.z_index || 0,
          border: isSelected ? '2px solid #2196f3' : '1px dashed rgba(255,255,255,0.3)',
          background: isSelected ? 'rgba(33,150,243,0.1)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'move',
          opacity: element.is_visible ? 1 : 0.4,
        }}
      >
        <Box sx={{ textAlign: 'center', color: '#fff', overflow: 'hidden', width: '100%', height: '100%', pointerEvents: 'none' }}>
          {element.element_type === 'text' ? (
            <Typography
              sx={{
                fontSize: `${(element.styles?.fontSize || 48) * canvasScale}px`,
                fontFamily: element.styles?.fontFamily || 'Arial',
                color: element.styles?.color || '#fff',
                textAlign: element.styles?.textAlign || 'center',
                p: 1,
              }}
            >
              {element.content || 'Text'}
            </Typography>
          ) : element.element_type === 'image' && (element._imagePreview || element.image) ? (
            <img
              src={element._imagePreview || element.image}
              alt={element.name}
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : element.element_type === 'video' && (element._videoPreview || element._videoFile || element.video) ? (
            <video
              src={element._videoPreview || element.video}
              muted
              autoPlay
              loop
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          ) : element.element_type === 'video' && element.content && getVideoEmbedUrl(element.content) ? (
            <Box
              component="iframe"
              src={getVideoEmbedUrl(element.content)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sx={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
            />
          ) : element.element_type === 'video' && element.content && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(element.content) ? (
            <Box
              component="video"
              src={element.content}
              muted
              sx={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
            />
          ) : element.element_type === 'countdown' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', transform: `scale(${canvasScale})`, transformOrigin: 'center center' }}>
              <CountdownRenderer
                targetDate={element.content || null}
                label={element.styles?.label}
                styles={element.styles}
              />
            </Box>
          ) : element.element_type === 'clock' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', transform: `scale(${canvasScale})`, transformOrigin: 'center center' }}>
              <ClockRenderer styles={element.styles} format={element.styles?.format} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <ElementIcon sx={{ fontSize: 32 * canvasScale, opacity: 0.7 }} />
              <Typography variant="caption" sx={{ opacity: 0.7, fontSize: 12 * canvasScale }}>
                {element.name}
              </Typography>
            </Box>
          )}
        </Box>
      </Rnd>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#1a1a1a' }}>
      {/* Left Sidebar - Element Toolbar */}
      <Paper
        sx={{
          width: 200,
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <IconButton onClick={() => {
            if (hasUnsavedChanges && !window.confirm(t('You have unsaved changes. Are you sure you want to leave?'))) return;
            navigate(`/admin/stagerunner/slides?config=${configId}`);
          }}>
            <BackIcon />
          </IconButton>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            {t('Add Element')}
          </Typography>
        </Box>
        <List dense sx={{ flex: 1, overflow: 'auto' }}>
          {elementTypes.map(({ type, label, icon: Icon }) => (
            <ListItemButton
              key={type}
              onClick={() => addElement(type)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t(label)} primaryTypographyProps={{ variant: 'body2' }} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('Layers')}
          </Typography>
          <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
            {(() => {
              const sorted = [...elements].sort((a, b) => (b.z_index || 0) - (a.z_index || 0));
              return sorted.map((element, idx) => (
              <ListItemButton
                key={element.id}
                selected={element.id === selectedElementId}
                onClick={() => setSelectedElementId(element.id)}
                sx={{ pr: 12, py: 0.25 }}
              >
                <ListItemText
                  primary={element.name}
                  primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                />
                <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); moveLayer(element.id, 'up'); }}
                    disabled={idx === 0}
                    sx={{ p: 0.25 }}
                  >
                    <ArrowUpIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); moveLayer(element.id, 'down'); }}
                    disabled={idx === sorted.length - 1}
                    sx={{ p: 0.25 }}
                  >
                    <ArrowDownIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateElement(element.id, { is_visible: !element.is_visible });
                    }}
                    sx={{ p: 0.25 }}
                  >
                    {element.is_visible ? <VisibleIcon sx={{ fontSize: 16 }} /> : <HiddenIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItemButton>
            ));
            })()}
          </List>
        </Box>
      </Paper>

      {/* Center - Canvas */}
      <Box
        id="canvas-container"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Top Bar */}
        <Paper sx={{ p: 1.5, borderRadius: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            value={slide.name}
            onChange={(e) => updateSlide({ name: e.target.value })}
            placeholder={t('Slide Name')}
            size="small"
            sx={{ width: 250 }}
          />
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>{t('Slide Type')}</InputLabel>
            <Select
              value={slide.slide_type}
              onChange={(e) => updateSlide({ slide_type: e.target.value })}
              label={t('Slide Type')}
            >
              {slideTypeOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{t(opt.label)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={slide.is_active}
                onChange={(e) => updateSlide({ is_active: e.target.checked })}
                size="small"
              />
            }
            label={t('Active')}
          />
          <Box sx={{ flex: 1 }} />
          {error && (
            <Alert severity="error" sx={{ py: 0 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Button
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(`/app/stagerunner/${slide.config_edition}`, '_blank')}
            size="small"
            disabled={!slide.config_edition}
          >
            {t('Preview')}
          </Button>
          {uploadProgress && (
            <Box sx={{ minWidth: 180, mr: 1 }}>
              <Typography variant="caption" color={uploadProgress.percent === -1 ? 'warning.main' : 'text.secondary'}>
                {uploadProgress.element}{uploadProgress.percent >= 0 ? `: ${uploadProgress.percent}%` : ''}
              </Typography>
              <LinearProgress
                variant={uploadProgress.percent === -1 ? 'indeterminate' : 'determinate'}
                value={uploadProgress.percent >= 0 ? uploadProgress.percent : undefined}
                color={uploadProgress.percent === -1 ? 'warning' : 'primary'}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t('Saving...') : t('Save')}
          </Button>
        </Paper>

        {/* Canvas Area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            overflow: 'auto',
          }}
        >
          <Box
            sx={{
              width: CANVAS_WIDTH * canvasScale,
              height: CANVAS_HEIGHT * canvasScale,
              bgcolor: slide.background_color,
              position: 'relative',
              boxShadow: '0 0 40px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Background effect preview */}
            {slide.background_effect && slide.background_effect !== 'none' && slide.background_effect !== 'inherit' && (
              <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                {webgl2Effects.includes(slide.background_effect) && (
                  <WebGL2Background shaderName={slide.background_effect} />
                )}
                {threeEffects.includes(slide.background_effect) && (
                  <ThreeBackground variant="stagerunner" effectIndex={effectIndexMap[slide.background_effect] || 0} />
                )}
              </Box>
            )}
            {elements.map(renderElement)}
          </Box>
        </Box>

        {/* Bottom Bar - Background */}
        <Paper sx={{ p: 1.5, borderRadius: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">{t('Background')}:</Typography>
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>{t('Effect')}</InputLabel>
            <Select
              value={slide.background_effect}
              onChange={(e) => updateSlide({ background_effect: e.target.value })}
              label={t('Effect')}
            >
              {backgroundEffectOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{t(opt.label)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ position: 'relative' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowColorPicker(!showColorPicker)}
              sx={{
                minWidth: 80,
                bgcolor: slide.background_color,
                '&:hover': { bgcolor: slide.background_color },
              }}
            >
              {slide.background_color}
            </Button>
            {showColorPicker && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  mb: 1,
                  zIndex: 10,
                  p: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 3,
                }}
              >
                <HexColorPicker
                  color={slide.background_color}
                  onChange={(color) => updateSlide({ background_color: color })}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Right Sidebar - Properties */}
      <Paper
        sx={{
          width: 280,
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2">
            {selectedElement ? t('Properties') : t('Select an element')}
          </Typography>
        </Box>

        {selectedElement && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <TextField
              fullWidth
              label={t('Name')}
              value={selectedElement.name}
              onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
              size="small"
              sx={{ mb: 2 }}
            />

            {selectedElement.element_type === 'text' && (
              <TextField
                fullWidth
                label={t('Content')}
                value={selectedElement.content}
                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                size="small"
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
            )}

            {selectedElement.element_type === 'countdown' && (
              <>
                <TextField
                  fullWidth
                  label={t('Target Date & Time')}
                  type="datetime-local"
                  value={selectedElement.content || ''}
                  onChange={(e) => updateElement(selectedElement.id, {
                    content: e.target.value || ''
                  })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    mb: 2,
                    '& input::-webkit-calendar-picker-indicator': {
                      filter: 'invert(1)',
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label={t('Label')}
                  value={selectedElement.styles?.label || ''}
                  onChange={(e) => updateElement(selectedElement.id, {
                    styles: { ...selectedElement.styles, label: e.target.value }
                  })}
                  size="small"
                  placeholder={t('e.g. Demo Compo starts in')}
                  sx={{ mb: 2 }}
                />
              </>
            )}

            {selectedElement.element_type === 'image' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  {t('Image')}
                </Typography>
                {(selectedElement._imagePreview || selectedElement.image) ? (
                  <Box sx={{ position: 'relative', mt: 1 }}>
                    <Box
                      component="img"
                      src={selectedElement._imagePreview || selectedElement.image}
                      alt={selectedElement.name}
                      sx={{ width: '100%', borderRadius: 1, maxHeight: 150, objectFit: 'contain', bgcolor: 'rgba(0,0,0,0.3)' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => updateElement(selectedElement.id, {
                        _imageFile: null, _imagePreview: null, image: null,
                      })}
                      sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.6)', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    fullWidth
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    {t('Upload Image')}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          updateElement(selectedElement.id, {
                            _imageFile: file,
                            _imagePreview: URL.createObjectURL(file),
                          });
                        }
                      }}
                    />
                  </Button>
                )}
              </Box>
            )}

            {selectedElement.element_type === 'video' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  {t('Video')}
                </Typography>
                {(selectedElement._videoFile || selectedElement._videoPreview || selectedElement.video) ? (
                  <Box sx={{ mt: 1 }}>
                    {/* File info */}
                    <Box sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, mb: 1,
                    }}>
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="caption" sx={{ color: 'success.main', display: 'block' }}>
                          {selectedElement._videoFile
                            ? `${selectedElement._videoFile.name} (${(selectedElement._videoFile.size / 1024 / 1024).toFixed(1)} MB)`
                            : selectedElement.video?.split('/').pop()
                          }
                        </Typography>
                        {selectedElement._videoFile && (
                          <Typography variant="caption" sx={{ color: 'warning.main' }}>
                            {t('Pending upload - click Save')}
                          </Typography>
                        )}
                        {selectedElement.video && !selectedElement._videoFile && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {t('Uploaded')}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => updateElement(selectedElement.id, {
                          _videoFile: null, _videoPreview: null, video: null,
                        })}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    {/* Video preview - only show if browser can play it */}
                    <Box
                      component="video"
                      src={selectedElement._videoPreview || selectedElement.video}
                      muted
                      controls
                      sx={{
                        width: '100%', borderRadius: 1, maxHeight: 150,
                        display: 'block',
                      }}
                      onError={(e) => {
                        // Hide unplayable video preview
                        e.target.style.display = 'none';
                        if (selectedElement.video && !selectedElement._videoPreview) {
                          const container = e.target.parentElement;
                          if (container && !container.querySelector('.converting-msg')) {
                            const msg = document.createElement('div');
                            msg.className = 'converting-msg';
                            msg.style.cssText = 'padding:8px;text-align:center;color:#ff9800;font-size:12px;';
                            msg.textContent = t('Video is being converted, please reload in a moment...');
                            container.appendChild(msg);
                          }
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Button
                    fullWidth
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    {t('Upload Video')}
                    <input
                      type="file"
                      hidden
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          updateElement(selectedElement.id, {
                            _videoFile: file,
                            _videoPreview: URL.createObjectURL(file),
                          });
                        }
                      }}
                    />
                  </Button>
                )}
                <Divider sx={{ my: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">{t('or')}</Typography>
                </Divider>
                <TextField
                  fullWidth
                  label={t('Video URL')}
                  placeholder="YouTube, Vimeo, Dailymotion..."
                  value={selectedElement.content || ''}
                  onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                  size="small"
                  helperText={
                    selectedElement.content && getVideoEmbedUrl(selectedElement.content)
                      ? t('Embed URL detected')
                      : selectedElement.content && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(selectedElement.content)
                      ? t('Direct video URL')
                      : selectedElement.content
                      ? t('Unrecognized URL format')
                      : null
                  }
                  FormHelperTextProps={{
                    sx: {
                      color: selectedElement.content && !isVideoUrl(selectedElement.content)
                        ? 'warning.main' : 'success.main',
                    },
                  }}
                />
                {selectedElement.content && getVideoEmbedUrl(selectedElement.content) && (
                  <Box sx={{ mt: 1, borderRadius: 1, overflow: 'hidden' }}>
                    <Box
                      component="iframe"
                      src={getVideoEmbedUrl(selectedElement.content)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      sx={{ width: '100%', height: 140, border: 'none' }}
                    />
                  </Box>
                )}
                {selectedElement.content && !getVideoEmbedUrl(selectedElement.content) && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(selectedElement.content) && (
                  <Box sx={{ mt: 1 }}>
                    <Box
                      component="video"
                      src={selectedElement.content}
                      muted
                      controls
                      sx={{ width: '100%', borderRadius: 1, maxHeight: 140 }}
                    />
                  </Box>
                )}
              </Box>
            )}

            <Typography variant="caption" color="text.secondary" gutterBottom>
              {t('Position')} (%)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="X"
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => updateElement(selectedElement.id, { x: parseFloat(e.target.value) || 0 })}
                size="small"
                inputProps={{ min: 0, max: 100 }}
              />
              <TextField
                label="Y"
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => updateElement(selectedElement.id, { y: parseFloat(e.target.value) || 0 })}
                size="small"
                inputProps={{ min: 0, max: 100 }}
              />
            </Box>

            <Typography variant="caption" color="text.secondary" gutterBottom>
              {t('Size')} (%)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="W"
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => updateElement(selectedElement.id, { width: parseFloat(e.target.value) || 10 })}
                size="small"
                inputProps={{ min: 1, max: 100 }}
              />
              <TextField
                label="H"
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => updateElement(selectedElement.id, { height: parseFloat(e.target.value) || 10 })}
                size="small"
                inputProps={{ min: 1, max: 100 }}
              />
            </Box>

            {selectedElement.element_type === 'clock' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  {t('Format')}
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={selectedElement.styles?.format || 'time'}
                  onChange={(e) => updateElement(selectedElement.id, {
                    styles: { ...selectedElement.styles, format: e.target.value }
                  })}
                  size="small"
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="time">{t('Time')}</MenuItem>
                  <MenuItem value="date">{t('Date')}</MenuItem>
                  <MenuItem value="datetime">{t('Date & Time')}</MenuItem>
                </TextField>
              </>
            )}

            {['text', 'clock', 'countdown'].includes(selectedElement.element_type) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  {t('Style')}
                </Typography>
                <TextField
                  fullWidth
                  label={t('Font Size')}
                  type="number"
                  value={selectedElement.styles?.fontSize || 48}
                  onChange={(e) => updateElement(selectedElement.id, {
                    styles: { ...selectedElement.styles, fontSize: parseInt(e.target.value) || 48 }
                  })}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      color: 'text.primary',
                      borderColor: 'rgba(255,255,255,0.23)',
                      '&:hover': { borderColor: 'rgba(255,255,255,0.5)' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 0.5,
                        bgcolor: selectedElement.styles?.color || '#ffffff',
                        border: '1px solid rgba(255,255,255,0.3)',
                        mr: 1,
                        flexShrink: 0,
                      }}
                    />
                    {selectedElement.styles?.color || '#ffffff'}
                  </Button>
                  {showTextColorPicker && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        mt: 1,
                        zIndex: 10,
                        p: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: 3,
                      }}
                    >
                      <HexColorPicker
                        color={selectedElement.styles?.color || '#ffffff'}
                        onChange={(color) => updateElement(selectedElement.id, {
                          styles: { ...selectedElement.styles, color }
                        })}
                      />
                    </Box>
                  )}
                </Box>
              </>
            )}

            {selectedElement.element_type === 'video' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  {t('Playback')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={selectedElement.styles?.muted === false}
                        onChange={(e) => updateElement(selectedElement.id, {
                          styles: { ...selectedElement.styles, muted: !e.target.checked }
                        })}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {selectedElement.styles?.muted === false
                          ? <VolumeUpIcon sx={{ fontSize: 18 }} />
                          : <VolumeOffIcon sx={{ fontSize: 18 }} />
                        }
                        <Typography variant="body2">{t('Audio')}</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={selectedElement.styles?.autoPlay !== false}
                        onChange={(e) => updateElement(selectedElement.id, {
                          styles: { ...selectedElement.styles, autoPlay: e.target.checked }
                        })}
                      />
                    }
                    label={<Typography variant="body2">{t('Autoplay')}</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={selectedElement.styles?.loop !== false}
                        onChange={(e) => updateElement(selectedElement.id, {
                          styles: { ...selectedElement.styles, loop: e.target.checked }
                        })}
                      />
                    }
                    label={<Typography variant="body2">{t('Loop')}</Typography>}
                  />
                </Box>
              </>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {t('Transition')}
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <InputLabel>{t('Enter')}</InputLabel>
              <Select
                value={selectedElement.enter_transition}
                onChange={(e) => updateElement(selectedElement.id, { enter_transition: e.target.value })}
                label={t('Enter')}
              >
                {transitionOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{t(opt.label)}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>{t('Exit')}</InputLabel>
              <Select
                value={selectedElement.exit_transition}
                onChange={(e) => updateElement(selectedElement.id, { exit_transition: e.target.value })}
                label={t('Exit')}
              >
                {transitionOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{t(opt.label)}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="caption" color="text.secondary">
              {t('Duration')}: {selectedElement.enter_duration}ms
            </Typography>
            <Slider
              value={selectedElement.enter_duration}
              onChange={(e, val) => updateElement(selectedElement.id, { enter_duration: val })}
              min={0}
              max={2000}
              step={100}
              size="small"
              sx={{ mb: 2 }}
            />

            <Typography variant="caption" color="text.secondary">
              {t('Delay')}: {selectedElement.enter_delay}ms
            </Typography>
            <Slider
              value={selectedElement.enter_delay}
              onChange={(e, val) => updateElement(selectedElement.id, { enter_delay: val })}
              min={0}
              max={2000}
              step={100}
              size="small"
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => deleteElement(selectedElement.id)}
            >
              {t('Delete Element')}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SlideEditorPage;
