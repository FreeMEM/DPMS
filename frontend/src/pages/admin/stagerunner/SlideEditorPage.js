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
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  Visibility as VisibleIcon,
  VisibilityOff as HiddenIcon,
  OpenInNew as OpenInNewIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AccessTime as ClockIcon,
  Timer as TimerIcon,
  ViewCarousel as ProductionIcon,
  Handshake as SponsorIcon,
  TextRotationNone as ScrollTextIcon,
} from '@mui/icons-material';
import { Rnd } from 'react-rnd';
import { HexColorPicker } from 'react-colorful';

import axiosWrapper from '../../../utils/AxiosWrapper';

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
  { value: 'none', label: 'None' },
];

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
  const [error, setError] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [canvasScale, setCanvasScale] = useState(0.5);

  // Get config ID from URL or from loaded slide
  const configId = urlConfigId || slide.config;

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
        if (element.id && !element._isNew) {
          await client.put(`/api/slide-elements/${element.id}/`, {
            ...element,
            slide: slideId,
          });
        } else {
          const { id: _, _isNew, ...elementData } = element;
          await client.post('/api/slide-elements/', {
            ...elementData,
            slide: slideId,
          });
        }
      }

      navigate(`/admin/stagerunner/slides?config=${configId}`);
    } catch (err) {
      setError('Error saving slide');
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
  };

  const updateElement = (elementId, updates) => {
    setElements(elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    ));
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
          width: `${element.width}%`,
          height: `${element.height}%`,
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
          const newWidth = parseFloat(ref.style.width) / (CANVAS_WIDTH * canvasScale) * 100;
          const newHeight = parseFloat(ref.style.height) / (CANVAS_HEIGHT * canvasScale) * 100;
          const newX = (position.x / (CANVAS_WIDTH * canvasScale)) * 100;
          const newY = (position.y / (CANVAS_HEIGHT * canvasScale)) * 100;
          updateElement(element.id, {
            width: newWidth,
            height: newHeight,
            x: newX,
            y: newY,
          });
        }}
        bounds="parent"
        onClick={() => setSelectedElementId(element.id)}
        style={{
          border: isSelected ? '2px solid #2196f3' : '1px dashed rgba(255,255,255,0.3)',
          background: isSelected ? 'rgba(33,150,243,0.1)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'move',
          opacity: element.is_visible ? 1 : 0.4,
        }}
      >
        <Box sx={{ textAlign: 'center', color: '#fff', p: 1, overflow: 'hidden', width: '100%' }}>
          {element.element_type === 'text' ? (
            <Typography
              sx={{
                fontSize: `${(element.styles?.fontSize || 48) * canvasScale}px`,
                fontFamily: element.styles?.fontFamily || 'Arial',
                color: element.styles?.color || '#fff',
                textAlign: element.styles?.textAlign || 'center',
              }}
            >
              {element.content || 'Text'}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
          <IconButton onClick={() => navigate(`/admin/stagerunner/slides?config=${configId}`)}>
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
            {elements.map((element) => (
              <ListItemButton
                key={element.id}
                selected={element.id === selectedElementId}
                onClick={() => setSelectedElementId(element.id)}
                sx={{ pr: 6 }}
              >
                <ListItemText
                  primary={element.name}
                  primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateElement(element.id, { is_visible: !element.is_visible });
                    }}
                  >
                    {element.is_visible ? <VisibleIcon fontSize="small" /> : <HiddenIcon fontSize="small" />}
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItemButton>
            ))}
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
            onChange={(e) => setSlide({ ...slide, name: e.target.value })}
            placeholder={t('Slide Name')}
            size="small"
            sx={{ width: 250 }}
          />
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>{t('Slide Type')}</InputLabel>
            <Select
              value={slide.slide_type}
              onChange={(e) => setSlide({ ...slide, slide_type: e.target.value })}
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
                onChange={(e) => setSlide({ ...slide, is_active: e.target.checked })}
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
              onChange={(e) => setSlide({ ...slide, background_effect: e.target.value })}
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
                  onChange={(color) => setSlide({ ...slide, background_color: color })}
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

            {selectedElement.element_type === 'text' && (
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
                <TextField
                  fullWidth
                  label={t('Color')}
                  value={selectedElement.styles?.color || '#ffffff'}
                  onChange={(e) => updateElement(selectedElement.id, {
                    styles: { ...selectedElement.styles, color: e.target.value }
                  })}
                  size="small"
                  sx={{ mb: 2 }}
                />
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
