import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeBackground from '../../components/common/ThreeBackground';
import WebGL2Background from '../../components/common/WebGL2Background';
import axiosWrapper from '../../utils/AxiosWrapper';
import {
  useStageRunnerData,
  useStageControl,
  useCurrentProduction,
  useProductionAutoAdvance,
} from '../../hooks/stagerunner';
import {
  CompoNameRenderer,
  CompoDescriptionRenderer,
  ProductionNumberRenderer,
  ProductionTitleRenderer,
  ProductionAuthorsRenderer,
  ProductionVideoRenderer,
  ProductionListRenderer,
  ResultsTableRenderer,
  PodiumRenderer,
  SponsorBarRenderer,
  SponsorGridRenderer,
  EditionLogoRenderer,
  EditionPosterRenderer,
  ClockRenderer,
  CountdownRenderer,
} from '../../components/stagerunner/renderers';

const transitionVariants = {
  none: {
    initial: {},
    animate: {},
    exit: {},
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide_left: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  slide_right: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  slide_up: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  slide_down: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  zoom: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  },
  bounce: {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 15 },
    },
    exit: { scale: 0, opacity: 0 },
  },
};

const effectIndexMap = {
  hyperspace: 0,
  wave: 1,
  'energy-grid': 2,
  'tron-grid': 3,
  'wuhu-boxes': 4,
  'wuhu-boxes-fire': 5,
  'wuhu-boxes-purple': 6,
  'floating-spheres': 7,
  'spinning-toroids': 8,
  'crystal-pyramids': 9,
  'infinite-tunnel': 10,
};

// Effects that use WebGL2Background instead of ThreeBackground
const webgl2Effects = [
  'wuhu-boxes',
  'wuhu-boxes-fire',
  'wuhu-boxes-purple',
];

// Effects that use Three.js particle systems
const threeEffects = [
  'hyperspace',
  'wave',
  'energy-grid',
  'tron-grid',
  'floating-spheres',
  'spinning-toroids',
  'crystal-pyramids',
  'infinite-tunnel',
];

const StageRunnerViewer = () => {
  const { editionId } = useParams();
  const [config, setConfig] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backgroundEnabled, setBackgroundEnabled] = useState(true);
  const [currentEffect, setCurrentEffect] = useState(0);
  const [currentEffectName, setCurrentEffectName] = useState('hyperspace');

  // Get current slide
  const slides = config?.slides?.filter(s => s.is_active) || [];
  const currentSlide = slides[currentSlideIndex];

  // Fetch dynamic data based on current slide
  const { compoData, resultsData, sponsors, edition } = useStageRunnerData(config, currentSlide);

  // Stage control for remote synchronization (polls every 5 seconds)
  const { control } = useStageControl(config?.id, 5000);

  // Production navigation for compo slides
  const productions = useMemo(() => compoData?.productions || [], [compoData?.productions]);
  const {
    currentProduction,
    currentIndex: productionIndex,
    totalCount: productionCount,
    goToNext: goToNextProduction,
    goToPrevious: goToPreviousProduction,
    goToIndex: goToProductionIndex,
  } = useCurrentProduction(productions);

  // Auto-advance productions if enabled
  useProductionAutoAdvance(
    productions,
    productionIndex,
    goToNextProduction,
    currentSlide?.auto_advance_productions || false,
    currentSlide?.production_display_time || 10000
  );

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const client = axiosWrapper();
        const response = await client.get(`/api/stagerunner-config/by-edition/?edition=${editionId}`);

        // Fetch full state
        const fullStateResponse = await client.get(`/api/stagerunner-config/${response.data.id}/full-state/`);
        setConfig(fullStateResponse.data);

        // Set background effect
        const effect = fullStateResponse.data.default_background_effect;
        if (effect && effect !== 'none') {
          setCurrentEffect(effectIndexMap[effect] || 0);
          setCurrentEffectName(effect);
        } else {
          setBackgroundEnabled(false);
        }

        setLoading(false);
      } catch (err) {
        setError('Error loading StageRunner configuration');
        setLoading(false);
      }
    };

    if (editionId) {
      fetchConfig();
    }
  }, [editionId]);

  // Handle remote control synchronization
  useEffect(() => {
    if (!control) return;

    // Sync slide index from control - this is the source of truth
    if (control.current_slide_index !== undefined && control.current_slide_index !== currentSlideIndex) {
      setCurrentSlideIndex(control.current_slide_index);
    }

    // Sync production index from control
    if (control.current_production_index !== undefined && control.current_production_index !== productionIndex) {
      goToProductionIndex(control.current_production_index);
    }
  }, [control, currentSlideIndex, productionIndex, goToProductionIndex]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isProductionSlide = currentSlide?.slide_type === 'production_show';

      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isProductionSlide && productionIndex < productionCount - 1) {
            goToNextProduction();
          } else {
            setCurrentSlideIndex(i => (i + 1) % slides.length);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (isProductionSlide && productionIndex > 0) {
            goToPreviousProduction();
          } else {
            setCurrentSlideIndex(i => (i - 1 + slides.length) % slides.length);
          }
          break;
        case 'Home':
          e.preventDefault();
          setCurrentSlideIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlideIndex(slides.length - 1);
          break;
        case 'F11':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
          break;
        case 'Escape':
          setCurrentSlideIndex(0);
          break;
        default:
          // Number keys 1-9 to jump to slide
          if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            if (index < slides.length) {
              setCurrentSlideIndex(index);
            }
          }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config, currentSlide, slides.length, productionIndex, productionCount, goToNextProduction, goToPreviousProduction]);

  // Update background effect when slide changes
  useEffect(() => {
    if (!config || !currentSlide) return;

    let effect = currentSlide.background_effect;
    if (effect === 'inherit') {
      effect = config.default_background_effect;
    }

    if (effect === 'none') {
      setBackgroundEnabled(false);
    } else {
      setBackgroundEnabled(true);
      setCurrentEffect(effectIndexMap[effect] || 0);
      setCurrentEffectName(effect);
    }
  }, [currentSlideIndex, config, currentSlide]);

  // Render dynamic element based on type
  const renderDynamicElement = useCallback((element) => {
    const { element_type, styles } = element;

    switch (element_type) {
      case 'compo_name':
        return <CompoNameRenderer compoData={compoData} styles={styles} />;

      case 'compo_description':
        return <CompoDescriptionRenderer compoData={compoData} styles={styles} />;

      case 'production_number':
        return (
          <ProductionNumberRenderer
            currentIndex={productionIndex}
            totalCount={productionCount}
            styles={styles}
          />
        );

      case 'production_title':
        return <ProductionTitleRenderer production={currentProduction} styles={styles} />;

      case 'production_authors':
        return (
          <ProductionAuthorsRenderer
            production={currentProduction}
            showAuthors={compoData?.compo?.show_authors}
            styles={styles}
          />
        );

      case 'production_video':
        return (
          <ProductionVideoRenderer
            production={currentProduction}
            videoMode={element.video_mode}
            styles={styles}
            onEnded={goToNextProduction}
          />
        );

      case 'production_list':
        return (
          <ProductionListRenderer
            productions={productions}
            maxItems={element.list_max_items}
            showPosition={element.list_show_position}
            currentIndex={productionIndex}
            styles={styles}
          />
        );

      case 'results_table':
        return (
          <ResultsTableRenderer
            results={resultsData?.results || []}
            maxItems={element.list_max_items}
            showPosition={element.list_show_position}
            showScore={element.list_show_score}
            revealedPositions={control?.revealed_positions || 0}
            styles={styles}
          />
        );

      case 'podium':
        return (
          <PodiumRenderer
            results={resultsData?.results || []}
            showPoints={element.podium_show_points}
            styles={styles}
          />
        );

      case 'sponsor_bar':
        return <SponsorBarRenderer sponsors={sponsors} styles={styles} />;

      case 'sponsor_grid':
        return <SponsorGridRenderer sponsors={sponsors} styles={styles} />;

      case 'edition_logo':
        return <EditionLogoRenderer edition={edition} styles={styles} />;

      case 'edition_poster':
        return <EditionPosterRenderer edition={edition} styles={styles} />;

      case 'clock':
        return <ClockRenderer styles={styles} format={styles?.format} />;

      case 'countdown':
        return (
          <CountdownRenderer
            targetDate={currentSlide?.countdown_target || control?.countdown_target}
            label={currentSlide?.countdown_label}
            styles={styles}
          />
        );

      case 'text':
        return (
          <Typography
            sx={{
              fontSize: styles?.fontSize || 48,
              fontFamily: styles?.fontFamily || 'Arial',
              color: styles?.color || '#fff',
              textAlign: styles?.textAlign || 'center',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              width: '100%',
            }}
          >
            {element.content}
          </Typography>
        );

      case 'image':
        if (!element.image) return null;
        return (
          <img
            src={element.image}
            alt={element.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: styles?.objectFit || 'contain',
            }}
          />
        );

      case 'video':
        if (!element.video) return null;
        return (
          <video
            src={element.video}
            autoPlay
            loop={styles?.loop}
            muted={styles?.muted !== false}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: styles?.objectFit || 'contain',
            }}
          />
        );

      default:
        return null;
    }
  }, [
    compoData,
    currentProduction,
    productionIndex,
    productionCount,
    productions,
    resultsData,
    sponsors,
    edition,
    control,
    currentSlide,
    goToNextProduction,
  ]);

  // Render element with transitions
  const renderElement = useCallback((element) => {
    const variants = transitionVariants[element.enter_transition] || transitionVariants.fade;

    return (
      <motion.div
        key={element.id}
        initial={variants.initial}
        animate={variants.animate}
        exit={transitionVariants[element.exit_transition]?.exit || variants.exit}
        transition={{
          duration: element.enter_duration / 1000,
          delay: element.enter_delay / 1000,
        }}
        style={{
          position: 'absolute',
          left: `${element.x}%`,
          top: `${element.y}%`,
          width: `${element.width}%`,
          height: `${element.height}%`,
          transform: `rotate(${element.rotation}deg)`,
          zIndex: element.z_index,
          display: element.is_visible ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {renderDynamicElement(element)}
      </motion.div>
    );
  }, [renderDynamicElement]);

  if (loading) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#000',
          color: '#fff',
        }}
      >
        <Typography variant="h4">Loading...</Typography>
      </Box>
    );
  }

  if (error || !config) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#000',
          color: '#fff',
        }}
      >
        <Typography variant="h4">{error || 'Configuration not found'}</Typography>
      </Box>
    );
  }

  if (!currentSlide) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#000',
          color: '#fff',
        }}
      >
        <ThreeBackground variant="stagerunner" effectIndex={currentEffect} />
        <Typography variant="h4">No slides configured</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: backgroundEnabled ? 'transparent' : (currentSlide.background_color || '#000'),
        position: 'relative',
        cursor: 'none',
      }}
    >
      {/* Background Color Layer (behind effect) */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: currentSlide.background_color || '#000',
          zIndex: -1,
        }}
      />

      {/* Background Effect */}
      {backgroundEnabled && webgl2Effects.includes(currentEffectName) && (
        <WebGL2Background shaderName={currentEffectName} />
      )}
      {backgroundEnabled && threeEffects.includes(currentEffectName) && (
        <ThreeBackground variant="stagerunner" effectIndex={currentEffect} />
      )}

      {/* Background Image */}
      {currentSlide.background_image && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${currentSlide.background_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 1,
          }}
        />
      )}

      {/* Slide Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentSlide.id}-${productionIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
          }}
        >
          {currentSlide.elements?.map(renderElement)}
        </motion.div>
      </AnimatePresence>

      {/* Debug info (hidden by default) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          color: 'rgba(255,255,255,0.3)',
          fontSize: 12,
          zIndex: 100,
        }}
      >
        Slide {currentSlideIndex + 1} / {slides.length}
        {currentSlide.slide_type === 'production_show' && productionCount > 0 && (
          <> | Production {productionIndex + 1} / {productionCount}</>
        )}
      </Box>
    </Box>
  );
};

export default StageRunnerViewer;
