import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Rating,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  HowToVote as VoteIcon,
  CheckCircle as CheckIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { editionsAPI, votingAPI } from '../services/api';
import MainBar from '../@dpms-freemem/MainBar';
import ThreeBackground from '../components/common/ThreeBackground';
import BackgroundToggle from '../components/common/BackgroundToggle';

const VotingPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingPeriods, setVotingPeriods] = useState([]);
  const [selectedEdition, setSelectedEdition] = useState(null);
  const [editions, setEditions] = useState([]);
  const [productions, setProductions] = useState([]);
  const [myVotes, setMyVotes] = useState({});
  const [votingConfig, setVotingConfig] = useState(null);
  const [saving, setSaving] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load open voting periods and editions
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [periodsRes, editionsRes] = await Promise.all([
          votingAPI.currentPeriods(),
          editionsAPI.list(),
        ]);

        setVotingPeriods(periodsRes.data);
        setEditions(editionsRes.data);

        // Auto-select edition with open voting
        if (periodsRes.data.length > 0) {
          const editionId = periodsRes.data[0].edition;
          setSelectedEdition(editionId);
        }
      } catch (err) {
        console.error('Error loading voting data:', err);
        setError(t('Error loading voting data'));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [t]);

  // Load productions and votes when edition is selected
  const loadEditionData = useCallback(async (editionId) => {
    try {
      setLoading(true);
      const [prodsRes, votesRes, configRes] = await Promise.all([
        editionsAPI.getProductions(editionId),
        votingAPI.myVotes(editionId),
        votingAPI.getConfig(editionId),
      ]);

      setProductions(prodsRes.data);

      // Index votes by production id
      const votesMap = {};
      (votesRes.data || []).forEach((vote) => {
        votesMap[vote.production] = vote;
      });
      setMyVotes(votesMap);

      // Config is an array, get first element
      const configs = configRes.data;
      if (Array.isArray(configs) && configs.length > 0) {
        setVotingConfig(configs[0]);
      }
    } catch (err) {
      console.error('Error loading edition data:', err);
      setError(t('Error loading productions'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (selectedEdition) {
      loadEditionData(selectedEdition);
    }
  }, [selectedEdition, loadEditionData]);

  const handleVote = async (productionId, score) => {
    if (!score || score < 1) return;

    setSaving((prev) => ({ ...prev, [productionId]: true }));

    try {
      const existingVote = myVotes[productionId];

      if (existingVote) {
        // Update existing vote
        const res = await votingAPI.updateVote(existingVote.id, {
          score,
        });
        setMyVotes((prev) => ({ ...prev, [productionId]: res.data }));
      } else {
        // Create new vote
        const res = await votingAPI.vote({
          production: productionId,
          score,
        });
        setMyVotes((prev) => ({ ...prev, [productionId]: res.data }));
      }

      setSnackbar({
        open: true,
        message: t('Vote saved'),
        severity: 'success',
      });
    } catch (err) {
      console.error('Error saving vote:', err);
      const detail = err.response?.data;
      let message = t('Error saving vote');
      if (detail) {
        if (typeof detail === 'string') {
          message = detail;
        } else if (detail.non_field_errors) {
          message = detail.non_field_errors.join(', ');
        } else if (detail.detail) {
          message = detail.detail;
        } else if (Array.isArray(detail)) {
          message = detail.join(', ');
        }
      }
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setSaving((prev) => ({ ...prev, [productionId]: false }));
    }
  };

  // Group productions by compo
  const productionsByCompo = {};
  productions.forEach((prod) => {
    const compoName = prod.compo_name || 'Sin categoría';
    if (!productionsByCompo[compoName]) {
      productionsByCompo[compoName] = [];
    }
    productionsByCompo[compoName].push(prod);
  });

  // Check if user can vote (open or jury mode)
  const isJuryMode = votingConfig?.voting_mode === 'jury';
  const isMixedMode = votingConfig?.voting_mode === 'mixed';

  const getVotingModeLabel = () => {
    if (isJuryMode) return t('Jury voting only');
    if (isMixedMode) return t('Mixed voting (public + jury)');
    return t('Public voting');
  };

  // Get remaining time for voting period
  const getTimeRemaining = () => {
    if (votingPeriods.length === 0) return null;
    const period = votingPeriods.find((p) => p.edition === selectedEdition);
    if (!period) return null;

    const end = new Date(period.end_date);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) return t('Voting ended');

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const editionTitle = editions.find((e) => e.id === selectedEdition)?.title || '';
  const timeRemaining = getTimeRemaining();
  const hasOpenVoting = votingPeriods.some((p) => p.edition === selectedEdition);
  const totalProductions = productions.length;
  const totalVoted = Object.keys(myVotes).length;

  const pageContent = (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <VoteIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4">{t('Vote')}</Typography>
          {editionTitle && (
            <Typography variant="body2" color="text.secondary">
              {editionTitle}
            </Typography>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && !selectedEdition ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : !hasOpenVoting ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('No open voting periods at this time.')}
        </Alert>
      ) : (
        <>
          {/* Voting info bar */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
              mb: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Chip
              label={getVotingModeLabel()}
              color="primary"
              variant="outlined"
            />
            {timeRemaining && (
              <Chip
                icon={<TimerIcon />}
                label={`${t('Time remaining')}: ${timeRemaining}`}
                color="warning"
                variant="outlined"
              />
            )}
            <Chip
              icon={<CheckIcon />}
              label={`${totalVoted} / ${totalProductions} ${t('voted')}`}
              color={totalVoted === totalProductions && totalProductions > 0 ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            Object.entries(productionsByCompo).map(([compoName, prods]) => (
              <Box key={compoName} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {compoName}
                  <Chip label={`${prods.length}`} size="small" variant="outlined" />
                </Typography>

                <Grid container spacing={2}>
                  {prods.map((production) => {
                    const vote = myVotes[production.id];
                    const isSaving = saving[production.id];

                    return (
                      <Grid item xs={12} sm={6} md={4} key={production.id}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderLeft: vote ? '3px solid' : '3px solid transparent',
                            borderColor: vote ? 'success.main' : 'transparent',
                            transition: 'border-color 0.2s',
                          }}
                        >
                          {/* Screenshot */}
                          {production.screenshot_url && (
                            <Box
                              sx={{
                                height: 160,
                                backgroundImage: `url(${production.screenshot_url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                              }}
                            />
                          )}

                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                              {production.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {production.authors}
                            </Typography>

                            {production.platform && (
                              <Chip
                                label={production.platform}
                                size="small"
                                variant="outlined"
                                sx={{ mb: 1 }}
                              />
                            )}
                          </CardContent>

                          <Divider />

                          {/* Voting area */}
                          <Box
                            sx={{
                              p: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 1,
                              bgcolor: vote ? 'rgba(46, 125, 50, 0.08)' : 'transparent',
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              {vote ? `${t('Your vote')}: ${vote.score}/10` : t('Rate this production')}
                            </Typography>
                            <Rating
                              value={vote ? vote.score / 2 : 0}
                              max={5}
                              precision={0.5}
                              onChange={(e, newValue) => {
                                if (newValue !== null) {
                                  handleVote(production.id, Math.round(newValue * 2));
                                }
                              }}
                              disabled={isSaving}
                              sx={{
                                '& .MuiRating-iconFilled': { color: 'primary.main' },
                                '& .MuiRating-iconHover': { color: 'primary.light' },
                                fontSize: '2rem',
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {isSaving ? t('Saving...') : '1-10'}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            ))
          )}

          {Object.keys(productionsByCompo).length === 0 && !loading && (
            <Alert severity="info">
              {t('No productions available for voting.')}
            </Alert>
          )}
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <ThreeBackground variant="user" />
      <BackgroundToggle />
      <MainBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: { sm: '64px' }, position: 'relative', zIndex: 1 }}>
        {pageContent}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VotingPage;
