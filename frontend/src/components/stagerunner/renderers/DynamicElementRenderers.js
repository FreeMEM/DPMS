/**
 * Dynamic Element Renderers for StageRunner
 * These components render data from the database (compos, productions, sponsors, etc.)
 */
import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

// Base styles for text elements
const getTextStyles = (styles = {}) => ({
  fontSize: styles.fontSize || 48,
  fontFamily: styles.fontFamily || 'Arial, sans-serif',
  color: styles.color || '#ffffff',
  textAlign: styles.textAlign || 'center',
  textShadow: styles.textShadow || '2px 2px 4px rgba(0,0,0,0.5)',
  width: '100%',
  lineHeight: styles.lineHeight || 1.2,
  fontWeight: styles.fontWeight || 'normal',
});

/**
 * Renders the compo name
 */
export const CompoNameRenderer = ({ compoData, styles }) => {
  if (!compoData?.compo?.name) {
    return null;
  }

  return (
    <Typography sx={getTextStyles(styles)}>
      {compoData.compo.name}
    </Typography>
  );
};

/**
 * Renders the compo description
 */
export const CompoDescriptionRenderer = ({ compoData, styles }) => {
  if (!compoData?.compo?.description) {
    return null;
  }

  return (
    <Typography sx={getTextStyles({ ...styles, fontSize: styles?.fontSize || 24 })}>
      {compoData.compo.description}
    </Typography>
  );
};

/**
 * Renders production number display (e.g., "3 / 12")
 */
export const ProductionNumberRenderer = ({ currentIndex, totalCount, styles }) => {
  if (totalCount === 0) {
    return null;
  }

  return (
    <Typography sx={getTextStyles({ ...styles, fontSize: styles?.fontSize || 36 })}>
      {currentIndex + 1} / {totalCount}
    </Typography>
  );
};

/**
 * Renders production title
 */
export const ProductionTitleRenderer = ({ production, styles }) => {
  if (!production?.title) {
    return null;
  }

  return (
    <Typography sx={getTextStyles({ ...styles, fontSize: styles?.fontSize || 64 })}>
      {production.title}
    </Typography>
  );
};

/**
 * Renders production authors
 */
export const ProductionAuthorsRenderer = ({ production, showAuthors = true, styles }) => {
  if (!production?.authors || !showAuthors) {
    return null;
  }

  return (
    <Typography sx={getTextStyles({ ...styles, fontSize: styles?.fontSize || 36, color: styles?.color || '#cccccc' })}>
      by {production.authors}
    </Typography>
  );
};

/**
 * Renders production video player
 */
export const ProductionVideoRenderer = ({ production, videoMode = 'inline', styles, onEnded }) => {
  if (!production?.video_url || videoMode === 'none') {
    return null;
  }

  if (videoMode === 'external') {
    // Just show "Playing on external monitor" message
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={getTextStyles({ ...styles, fontSize: 24, color: '#888888' })}>
          Video playing on external monitor
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <video
        src={production.video_url}
        autoPlay
        controls={false}
        onEnded={onEnded}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: styles?.objectFit || 'contain',
        }}
      />
    </Box>
  );
};

/**
 * Renders a list of productions
 */
export const ProductionListRenderer = ({
  productions = [],
  maxItems = 10,
  showPosition = true,
  currentIndex = -1,
  styles,
}) => {
  const displayProductions = productions.slice(0, maxItems);

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {displayProductions.map((prod, index) => (
        <Box
          key={prod.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            backgroundColor: index === currentIndex ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderRadius: '4px',
            marginBottom: '4px',
          }}
        >
          {showPosition && (
            <Typography
              sx={{
                ...getTextStyles({ ...styles, textAlign: 'right' }),
                width: '60px',
                marginRight: '16px',
                color: styles?.positionColor || '#888888',
              }}
            >
              {index + 1}.
            </Typography>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography sx={getTextStyles(styles)}>
              {prod.title}
            </Typography>
            {prod.authors && (
              <Typography
                sx={{
                  ...getTextStyles({ ...styles, fontSize: (styles?.fontSize || 28) * 0.7 }),
                  color: styles?.authorsColor || '#888888',
                }}
              >
                by {prod.authors}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

/**
 * Renders results table with scores
 */
export const ResultsTableRenderer = ({
  results = [],
  maxItems = 10,
  showPosition = true,
  showScore = true,
  revealedPositions = 0,
  styles,
}) => {
  // Show results from end based on revealed positions
  // If revealedPositions is 0, show nothing
  // If revealedPositions is 3, show positions 3, 2, 1 (last three)
  const totalResults = results.length;
  const startIndex = revealedPositions > 0 ? Math.max(0, totalResults - revealedPositions) : totalResults;
  const visibleResults = results.slice(startIndex);

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {visibleResults.map((result, displayIndex) => {
        const actualPosition = startIndex + displayIndex + 1;
        const isJustRevealed = actualPosition === totalResults - revealedPositions + 1;

        return (
          <motion.div
            key={result.production.id}
            initial={isJustRevealed ? { opacity: 0, x: -50 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: actualPosition <= 3 ? `rgba(255,215,0,${0.3 - (actualPosition - 1) * 0.1})` : 'rgba(255,255,255,0.05)',
                borderRadius: '4px',
                marginBottom: '8px',
                border: actualPosition === 1 ? '2px solid gold' : 'none',
              }}
            >
              {showPosition && (
                <Typography
                  sx={{
                    ...getTextStyles({ ...styles, textAlign: 'center' }),
                    width: '60px',
                    marginRight: '16px',
                    color: actualPosition === 1 ? '#ffd700' : actualPosition === 2 ? '#c0c0c0' : actualPosition === 3 ? '#cd7f32' : '#ffffff',
                    fontWeight: actualPosition <= 3 ? 'bold' : 'normal',
                  }}
                >
                  #{actualPosition}
                </Typography>
              )}
              <Box sx={{ flex: 1 }}>
                <Typography sx={getTextStyles(styles)}>
                  {result.production.title}
                </Typography>
                {result.production.authors && (
                  <Typography
                    sx={{
                      ...getTextStyles({ ...styles, fontSize: (styles?.fontSize || 28) * 0.7 }),
                      color: '#888888',
                    }}
                  >
                    by {result.production.authors}
                  </Typography>
                )}
              </Box>
              {showScore && (
                <Typography
                  sx={{
                    ...getTextStyles({ ...styles, textAlign: 'right' }),
                    width: '100px',
                    color: '#ffd700',
                  }}
                >
                  {result.score.toFixed(1)}
                </Typography>
              )}
            </Box>
          </motion.div>
        );
      })}
    </Box>
  );
};

/**
 * Renders animated podium for top 3
 */
export const PodiumRenderer = ({ results = [], showPoints = true, styles }) => {
  const top3 = results.slice(0, 3);

  if (top3.length === 0) {
    return null;
  }

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const heights = ['60%', '80%', '50%'];
  const colors = ['#c0c0c0', '#ffd700', '#cd7f32'];

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '20px',
        padding: '20px',
      }}
    >
      {podiumOrder.map((result, index) => {
        if (!result) return null;
        const actualIndex = index === 1 ? 0 : index === 0 ? 1 : 2;

        return (
          <motion.div
            key={result.production.id}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.3, duration: 0.5, type: 'spring' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '30%',
            }}
          >
            {/* Production info */}
            <Box sx={{ textAlign: 'center', marginBottom: '16px' }}>
              <Typography
                sx={{
                  ...getTextStyles({ ...styles, fontSize: index === 1 ? 36 : 28 }),
                  color: colors[index],
                }}
              >
                {result.production.title}
              </Typography>
              {result.production.authors && (
                <Typography
                  sx={{
                    ...getTextStyles({ ...styles, fontSize: 18 }),
                    color: '#888888',
                  }}
                >
                  by {result.production.authors}
                </Typography>
              )}
              {showPoints && (
                <Typography
                  sx={{
                    ...getTextStyles({ ...styles, fontSize: 24 }),
                    color: colors[index],
                    marginTop: '8px',
                  }}
                >
                  {result.score.toFixed(1)} pts
                </Typography>
              )}
            </Box>

            {/* Podium block */}
            <Box
              sx={{
                width: '100%',
                height: heights[index],
                backgroundColor: colors[index],
                borderRadius: '8px 8px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <Typography
                sx={{
                  fontSize: index === 1 ? 72 : 48,
                  fontWeight: 'bold',
                  color: '#000000',
                }}
              >
                {actualIndex + 1}
              </Typography>
            </Box>
          </motion.div>
        );
      })}
    </Box>
  );
};

/**
 * Renders sponsor bar (horizontal scrolling)
 */
export const SponsorBarRenderer = ({ sponsors = [], styles }) => {
  if (sponsors.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: '40px',
        padding: '0 20px',
      }}
    >
      {sponsors.map((sponsor) => (
        <Box
          key={sponsor.id}
          sx={{
            height: '80%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {sponsor.logo ? (
            <img
              src={sponsor.logo}
              alt={sponsor.name}
              style={{
                maxHeight: '100%',
                maxWidth: '200px',
                objectFit: 'contain',
                filter: styles?.grayscale ? 'grayscale(100%)' : 'none',
              }}
            />
          ) : (
            <Typography sx={getTextStyles({ ...styles, fontSize: 24 })}>
              {sponsor.name}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

/**
 * Renders sponsor grid
 */
export const SponsorGridRenderer = ({ sponsors = [], styles }) => {
  if (sponsors.length === 0) {
    return null;
  }

  // Group by tier
  const tiers = {
    platinum: sponsors.filter(s => s.tier === 'platinum'),
    gold: sponsors.filter(s => s.tier === 'gold'),
    silver: sponsors.filter(s => s.tier === 'silver'),
    bronze: sponsors.filter(s => s.tier === 'bronze'),
    other: sponsors.filter(s => !['platinum', 'gold', 'silver', 'bronze'].includes(s.tier)),
  };

  const renderTier = (tierSponsors, tierName, logoSize) => {
    if (tierSponsors.length === 0) return null;

    return (
      <Box key={tierName} sx={{ marginBottom: '20px' }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '30px',
          }}
        >
          {tierSponsors.map((sponsor) => (
            <Box
              key={sponsor.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {sponsor.logo ? (
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  style={{
                    maxHeight: logoSize,
                    maxWidth: logoSize * 2,
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Typography sx={getTextStyles({ ...styles, fontSize: logoSize / 4 })}>
                  {sponsor.name}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'hidden', padding: '20px' }}>
      {renderTier(tiers.platinum, 'platinum', 150)}
      {renderTier(tiers.gold, 'gold', 120)}
      {renderTier(tiers.silver, 'silver', 100)}
      {renderTier(tiers.bronze, 'bronze', 80)}
      {renderTier(tiers.other, 'other', 80)}
    </Box>
  );
};

/**
 * Renders edition logo
 */
export const EditionLogoRenderer = ({ edition, styles }) => {
  if (!edition?.logo) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img
        src={edition.logo}
        alt={edition.title}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: styles?.objectFit || 'contain',
        }}
      />
    </Box>
  );
};

/**
 * Renders edition poster
 */
export const EditionPosterRenderer = ({ edition, styles }) => {
  if (!edition?.poster) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img
        src={edition.poster}
        alt={edition.title}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: styles?.objectFit || 'contain',
        }}
      />
    </Box>
  );
};

/**
 * Renders a live clock
 */
export const ClockRenderer = ({ styles, format = 'time' }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    if (format === 'date') {
      return time.toLocaleDateString();
    } else if (format === 'datetime') {
      return time.toLocaleString();
    }
    return time.toLocaleTimeString();
  };

  return (
    <Typography sx={getTextStyles({ ...styles, fontSize: styles?.fontSize || 72 })}>
      {formatTime()}
    </Typography>
  );
};

/**
 * Renders a countdown timer
 */
export const CountdownRenderer = ({ targetDate, label, styles, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(null);
      return;
    }

    const target = new Date(targetDate);

    const updateCountdown = () => {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, completed: true });
        onComplete?.();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, completed: false });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  if (!timeLeft) {
    return null;
  }

  const formatNumber = (n) => String(n).padStart(2, '0');

  return (
    <Box sx={{ textAlign: 'center' }}>
      {label && (
        <Typography sx={getTextStyles({ ...styles, fontSize: (styles?.fontSize || 48) * 0.5, marginBottom: '16px' })}>
          {label}
        </Typography>
      )}
      <Typography sx={getTextStyles({ ...styles, fontSize: styles?.fontSize || 96, fontFamily: 'monospace' })}>
        {timeLeft.completed ? '00:00:00' : `${formatNumber(timeLeft.hours)}:${formatNumber(timeLeft.minutes)}:${formatNumber(timeLeft.seconds)}`}
      </Typography>
    </Box>
  );
};

const DynamicElementRenderers = {
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
};

export default DynamicElementRenderers;
