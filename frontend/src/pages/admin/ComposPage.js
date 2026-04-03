import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  Switch,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Settings as SettingsIcon,
  EmojiEvents as TrophyIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { ConfirmDialog, LoadingSpinner } from '../../components/admin/common';
import axiosWrapper from '../../utils/AxiosWrapper';

const ComposPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Core data
  const [editions, setEditions] = useState([]);
  const [selectedEditionId, setSelectedEditionId] = useState('');
  const [allCompos, setAllCompos] = useState([]);
  const [hasCompos, setHasCompos] = useState([]);
  const [votingResults, setVotingResults] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [editionLoading, setEditionLoading] = useState(false);
  const [togglingCompo, setTogglingCompo] = useState(null);

  // UI state
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCompoId, setExpandedCompoId] = useState(null);

  // Productions cache (compoId -> productions[])
  const [productions, setProductions] = useState({});
  const [productionsLoading, setProductionsLoading] = useState({});

  // Dialogs
  const [deleteDialog, setDeleteDialog] = useState({ open: false, compo: null });
  const [deactivateDialog, setDeactivateDialog] = useState({ open: false, hasCompo: null, compo: null });
  const [settingsDialog, setSettingsDialog] = useState({ open: false, hasCompo: null });
  const [settingsForm, setSettingsForm] = useState({
    open_to_upload: false,
    open_to_update: false,
    show_authors_on_slide: true,
  });

  // Initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const client = axiosWrapper();
        const [editionsRes, composRes] = await Promise.all([
          client.get('/api/editions/'),
          client.get('/api/compos/'),
        ]);
        const editionsList = editionsRes.data || [];
        setEditions(editionsList);
        setAllCompos(composRes.data || []);

        // Auto-select most recent edition
        if (editionsList.length > 0) {
          setSelectedEditionId(editionsList[0].id);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Error al cargar los datos iniciales');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch edition-specific data when edition changes
  const fetchEditionData = useCallback(async (editionId) => {
    if (!editionId) return;
    try {
      setEditionLoading(true);
      setExpandedCompoId(null);
      setProductions({});
      setProductionsLoading({});

      const client = axiosWrapper();
      const [hasComposRes, votingRes] = await Promise.allSettled([
        client.get(`/api/editions/${editionId}/compos/`),
        client.get('/api/voting-results/edition_results/', { params: { edition: editionId } }),
      ]);

      setHasCompos(hasComposRes.status === 'fulfilled' ? (hasComposRes.value.data || []) : []);
      setVotingResults(votingRes.status === 'fulfilled' ? votingRes.value.data : null);
      setError(null);
    } catch (err) {
      console.error('Error fetching edition data:', err);
      setError('Error al cargar datos de la edición');
    } finally {
      setEditionLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEditionId) {
      fetchEditionData(selectedEditionId);
    }
  }, [selectedEditionId, fetchEditionData]);

  // Helpers
  const getHasCompoForCompo = (compoId) => {
    return hasCompos.find(hc => hc.compo === compoId);
  };

  const getProductionCount = (compoId) => {
    if (productions[compoId]) return productions[compoId].length;
    const hc = getHasCompoForCompo(compoId);
    return hc ? '...' : 0;
  };

  const getVotingResultsForCompo = (compoName) => {
    if (!votingResults?.results_by_compo) return [];
    return votingResults.results_by_compo[compoName] || [];
  };

  // Toggle compo active/inactive
  const handleToggleCompo = async (compo) => {
    const existingHasCompo = getHasCompoForCompo(compo.id);

    if (existingHasCompo) {
      // Deactivate - show confirm dialog
      setDeactivateDialog({ open: true, hasCompo: existingHasCompo, compo });
      return;
    }

    // Activate
    try {
      setTogglingCompo(compo.id);
      const client = axiosWrapper();
      await client.post('/api/hascompos/', {
        edition: selectedEditionId,
        compo: compo.id,
        start: new Date().toISOString(),
      });
      await fetchEditionData(selectedEditionId);
    } catch (err) {
      console.error('Error activating compo:', err);
      setError(err.response?.data?.detail || 'Error al activar la competición');
    } finally {
      setTogglingCompo(null);
    }
  };

  const handleDeactivateConfirm = async () => {
    const { hasCompo } = deactivateDialog;
    try {
      setTogglingCompo(hasCompo.compo);
      const client = axiosWrapper();
      await client.delete(`/api/hascompos/${hasCompo.id}/`);
      await fetchEditionData(selectedEditionId);
      setDeactivateDialog({ open: false, hasCompo: null, compo: null });
    } catch (err) {
      console.error('Error deactivating compo:', err);
      setError('Error al desactivar la competición');
    } finally {
      setTogglingCompo(null);
    }
  };

  // Expand/collapse compo to show productions
  const handleExpandCompo = async (compoId) => {
    if (expandedCompoId === compoId) {
      setExpandedCompoId(null);
      return;
    }

    setExpandedCompoId(compoId);

    // Fetch productions if not cached
    if (!productions[compoId]) {
      try {
        setProductionsLoading(prev => ({ ...prev, [compoId]: true }));
        const client = axiosWrapper();
        const res = await client.get(`/api/editions/${selectedEditionId}/productions/`, {
          params: { compo: compoId },
        });
        setProductions(prev => ({ ...prev, [compoId]: res.data || [] }));
      } catch (err) {
        console.error('Error fetching productions:', err);
        setProductions(prev => ({ ...prev, [compoId]: [] }));
      } finally {
        setProductionsLoading(prev => ({ ...prev, [compoId]: false }));
      }
    }
  };

  // HasCompo settings dialog
  const handleOpenSettings = (hasCompo) => {
    setSettingsForm({
      open_to_upload: hasCompo.open_to_upload,
      open_to_update: hasCompo.open_to_update,
      show_authors_on_slide: hasCompo.show_authors_on_slide,
    });
    setSettingsDialog({ open: true, hasCompo });
  };

  const handleSaveSettings = async () => {
    const { hasCompo } = settingsDialog;
    try {
      const client = axiosWrapper();
      await client.put(`/api/hascompos/${hasCompo.id}/`, {
        edition: hasCompo.edition,
        compo: hasCompo.compo,
        start: hasCompo.start,
        ...settingsForm,
      });
      await fetchEditionData(selectedEditionId);
      setSettingsDialog({ open: false, hasCompo: null });
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Error al actualizar la configuración');
    }
  };

  // Delete compo (global)
  const handleDeleteCompo = async () => {
    try {
      const client = axiosWrapper();
      await client.delete(`/api/compos/${deleteDialog.compo.id}/`);
      const composRes = await client.get('/api/compos/');
      setAllCompos(composRes.data || []);
      setDeleteDialog({ open: false, compo: null });
      if (selectedEditionId) {
        await fetchEditionData(selectedEditionId);
      }
    } catch (err) {
      console.error('Error deleting compo:', err);
      setError('Error al eliminar la competición');
    }
  };

  // Date formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filtered compos
  const filteredCompos = allCompos.filter((compo) =>
    compo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout title={t("Competitions Management")}>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  const selectedEdition = editions.find(e => e.id === selectedEditionId);

  return (
    <AdminLayout
      title={t("Competitions Management")}
      breadcrumbs={[{ label: t('Competitions'), href: '#' }]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {editions.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("No editions found. Create an edition first to manage competitions.")}
        </Alert>
      ) : (
        <>
          {/* Top bar: Edition selector + New Competition */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 350 }}>
              <InputLabel>{t("Edition")}</InputLabel>
              <Select
                value={selectedEditionId}
                label={t("Edition")}
                onChange={(e) => setSelectedEditionId(e.target.value)}
              >
                {editions.map((edition) => (
                  <MenuItem key={edition.id} value={edition.id}>
                    {edition.title}
                    {edition.public && (
                      <Chip label={t("Public")} size="small" color="success" sx={{ ml: 1 }} />
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/compos/new')}
            >
              {t("New Competition")}
            </Button>
          </Box>

          {/* Search */}
          <Box sx={{ mb: 2 }}>
            <TextField
              placeholder={t("Search competitions...")}
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
          </Box>

          {/* Edition info bar */}
          {selectedEdition && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {selectedEdition.open_to_upload && (
                <Chip icon={<UploadIcon />} label={t("Submissions open")} color="success" size="small" />
              )}
              {votingResults && (
                <Chip
                  icon={<TrophyIcon />}
                  label={`${t("Voting")}: ${votingResults.voting_mode}`}
                  color="info"
                  size="small"
                />
              )}
              {votingResults?.results_published_at && (
                <Chip label={t("Results published")} color="warning" size="small" />
              )}
            </Box>
          )}

          {/* Main table */}
          <Paper sx={{ position: 'relative' }}>
            {editionLoading && (
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 70 }}>{t("Active")}</TableCell>
                    <TableCell>{t("Name")}</TableCell>
                    <TableCell>{t("Description")}</TableCell>
                    <TableCell align="center">{t("Settings")}</TableCell>
                    <TableCell align="center">{t("Productions")}</TableCell>
                    <TableCell align="right">{t("Actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCompos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          {searchTerm
                            ? t('No competitions found')
                            : t('No competitions. Create a new one to get started.')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompos.map((compo) => {
                      const hasCompo = getHasCompoForCompo(compo.id);
                      const isActive = !!hasCompo;
                      const isExpanded = expandedCompoId === compo.id;
                      const isToggling = togglingCompo === compo.id;
                      const prodCount = getProductionCount(compo.id);

                      return (
                        <React.Fragment key={compo.id}>
                          {/* Main compo row */}
                          <TableRow
                            hover
                            sx={{
                              bgcolor: isActive ? 'rgba(255, 165, 0, 0.04)' : 'transparent',
                              '& > *': { borderBottom: isExpanded ? 'none' : undefined },
                            }}
                          >
                            <TableCell>
                              <Switch
                                checked={isActive}
                                onChange={() => handleToggleCompo(compo)}
                                disabled={isToggling || editionLoading}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {compo.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  maxWidth: 250,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {compo.description || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {isActive ? (
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                                  {hasCompo.open_to_upload && (
                                    <Chip label={t("Upload")} size="small" color="success" variant="outlined" />
                                  )}
                                  {hasCompo.open_to_update && (
                                    <Chip label={t("Update")} size="small" color="info" variant="outlined" />
                                  )}
                                  {hasCompo.show_authors_on_slide && (
                                    <Chip label={t("Authors")} size="small" variant="outlined" />
                                  )}
                                  <Tooltip title={t("Edit settings")}>
                                    <IconButton size="small" onClick={() => handleOpenSettings(hasCompo)}>
                                      <SettingsIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {isActive ? (
                                <Chip
                                  label={prodCount}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              {isActive && (
                                <Tooltip title={isExpanded ? t("Collapse") : t("Expand productions")}>
                                  <IconButton size="small" onClick={() => handleExpandCompo(compo.id)}>
                                    {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title={t("View detail")}>
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/admin/compos/${compo.id}`)}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t("Edit")}>
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/admin/compos/${compo.id}/edit`)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t("Delete")}>
                                <IconButton
                                  size="small"
                                  onClick={() => setDeleteDialog({ open: true, compo })}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>

                          {/* Expandable productions sub-table */}
                          {isActive && (
                            <TableRow>
                              <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <ProductionsSubTable
                                    compo={compo}
                                    productions={productions[compo.id] || []}
                                    loading={productionsLoading[compo.id]}
                                    votingResults={getVotingResultsForCompo(compo.name)}
                                    formatDate={formatDate}
                                    navigate={navigate}
                                    t={t}
                                  />
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Delete compo dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, compo: null })}
        onConfirm={handleDeleteCompo}
        title={t("Delete Competition")}
        message={t('Are you sure you want to delete the competition "{{name}}"? This action cannot be undone.', { name: deleteDialog.compo?.name })}
      />

      {/* Deactivate compo dialog */}
      <ConfirmDialog
        open={deactivateDialog.open}
        onClose={() => setDeactivateDialog({ open: false, hasCompo: null, compo: null })}
        onConfirm={handleDeactivateConfirm}
        title={t("Deactivate Competition")}
        message={t('Are you sure you want to deactivate "{{name}}" for this edition? The HasCompo link will be removed.', { name: deactivateDialog.compo?.name })}
      />

      {/* HasCompo settings dialog */}
      <Dialog
        open={settingsDialog.open}
        onClose={() => setSettingsDialog({ open: false, hasCompo: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("Competition Settings")}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settingsForm.open_to_upload}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, open_to_upload: e.target.checked }))}
                />
              }
              label={t("Open to upload")}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settingsForm.open_to_update}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, open_to_update: e.target.checked }))}
                />
              }
              label={t("Open to update")}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settingsForm.show_authors_on_slide}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, show_authors_on_slide: e.target.checked }))}
                />
              }
              label={t("Show authors on slide")}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog({ open: false, hasCompo: null })}>
            {t("Cancel")}
          </Button>
          <Button variant="contained" onClick={handleSaveSettings}>
            {t("Save")}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

// Sub-component for productions table within a compo row
const ProductionsSubTable = ({ compo, productions, loading, votingResults, formatDate, navigate, t }) => {
  // Build lookup map from voting results
  const resultMap = {};
  if (votingResults && votingResults.length > 0) {
    votingResults.forEach(r => {
      resultMap[r.production_id] = r;
    });
  }
  const hasVoting = votingResults && votingResults.length > 0;

  // Sort: by ranking if voting exists, otherwise by created desc
  const sortedProductions = [...productions].sort((a, b) => {
    const ra = resultMap[a.id];
    const rb = resultMap[b.id];
    if (ra && rb) return ra.ranking - rb.ranking;
    if (ra) return -1;
    if (rb) return 1;
    return new Date(b.created) - new Date(a.created);
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (sortedProductions.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t("No productions submitted for this competition")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255, 165, 0, 0.1)' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {hasVoting && <TableCell sx={{ width: 50 }}>#</TableCell>}
            <TableCell>{t("Title")}</TableCell>
            <TableCell>{t("Author")}</TableCell>
            <TableCell>{t("Submitted")}</TableCell>
            {hasVoting && (
              <>
                <TableCell align="center">{t("Votes")}</TableCell>
                <TableCell align="center">{t("Score")}</TableCell>
              </>
            )}
            <TableCell align="right">{t("Actions")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedProductions.map((prod) => {
            const result = resultMap[prod.id];
            return (
              <TableRow key={prod.id} hover>
                {hasVoting && (
                  <TableCell>
                    {result ? (
                      <Chip
                        label={`${result.ranking}`}
                        size="small"
                        color={result.ranking <= 3 ? 'primary' : 'default'}
                        variant={result.ranking <= 3 ? 'filled' : 'outlined'}
                        icon={result.ranking <= 3 ? <TrophyIcon /> : undefined}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {prod.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {prod.authors}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(prod.created)}
                  </Typography>
                </TableCell>
                {hasVoting && (
                  <>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {result?.total_votes ?? '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {result?.final_score ?? '-'}
                      </Typography>
                    </TableCell>
                  </>
                )}
                <TableCell align="right">
                  <Tooltip title={t("View production")}>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/productions/${prod.id}`)}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ComposPage;
