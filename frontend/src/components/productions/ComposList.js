import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  EmojiEvents as TrophyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  Devices as PlatformIcon,
  Event as ReleaseDateIcon,
  YouTube as YouTubeIcon,
  Link as LinkIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { editionsAPI, votingResultsAPI, productionsAPI, filesAPI } from '../../services/api';
import MainBar from '../../@dpms-freemem/MainBar';
import ThreeBackground from '../common/ThreeBackground';
import BackgroundToggle from '../common/BackgroundToggle';

const RANKING_COLORS = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

// External link button helper
const ExternalLinkButton = ({ href, label, icon, color }) => {
  if (!href) return null;
  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={icon}
      endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        textTransform: 'none',
        borderColor: color || 'divider',
        color: color || 'text.secondary',
        '&:hover': { borderColor: color || 'primary.main' },
      }}
    >
      {label}
    </Button>
  );
};

// Modal for production detail
const ProductionDetailDialog = ({ open, onClose, productionId, result, t }) => {
  const [production, setProduction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && productionId) {
      setLoading(true);
      setError(null);
      productionsAPI.get(productionId)
        .then(res => setProduction(res.data))
        .catch(() => setError(t('Error loading production details')))
        .finally(() => setLoading(false));
    }
    if (!open) {
      setProduction(null);
      setError(null);
    }
  }, [open, productionId, t]);

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await filesAPI.download(fileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  const hasExternalLinks = production && (
    production.youtube_url || production.demozoo_url || production.pouet_url || production.scene_org_url
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderTop: result?.ranking <= 3 ? `3px solid ${RANKING_COLORS[result.ranking]}` : undefined }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 6 }}>
        {result && (
          <Chip
            label={`#${result.ranking}`}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: RANKING_COLORS[result.ranking] || 'action.selected',
              color: result.ranking <= 3 ? '#000' : 'text.primary',
            }}
          />
        )}
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          {result?.production_title || production?.title || '...'}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {production && !loading && (
          <Box>
            {/* Screenshot */}
            {production.screenshot_url && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Box
                  component="img"
                  src={production.screenshot_url}
                  alt={production.title}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Box>
            )}

            {/* YouTube embed */}
            {production.youtube_url && (() => {
              const match = production.youtube_url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
              const videoId = match?.[1];
              return videoId ? (
                <Box sx={{ mb: 2, position: 'relative', paddingTop: '56.25%', borderRadius: 1, overflow: 'hidden' }}>
                  <Box
                    component="iframe"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 0,
                    }}
                  />
                </Box>
              ) : null;
            })()}

            {/* Info table */}
            <Table size="small" sx={{ '& td': { border: 0, py: 0.75, verticalAlign: 'top' } }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ width: 40, pl: 0 }}>
                    <PersonIcon fontSize="small" color="action" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, width: 110 }}>{t("Authors")}</TableCell>
                  <TableCell>{production.authors}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ pl: 0 }}>
                    <CategoryIcon fontSize="small" color="action" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{t("Competition")}</TableCell>
                  <TableCell>{production.compo_name}</TableCell>
                </TableRow>
                {production.platform_display && production.platform && (
                  <TableRow>
                    <TableCell sx={{ pl: 0 }}>
                      <PlatformIcon fontSize="small" color="action" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{t("Platform")}</TableCell>
                    <TableCell>{production.platform_display}</TableCell>
                  </TableRow>
                )}
                {production.release_date && (
                  <TableRow>
                    <TableCell sx={{ pl: 0 }}>
                      <ReleaseDateIcon fontSize="small" color="action" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{t("Release date")}</TableCell>
                    <TableCell>{new Date(production.release_date + 'T00:00:00').toLocaleDateString()}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell sx={{ pl: 0 }}>
                    <CalendarIcon fontSize="small" color="action" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{t("Submitted")}</TableCell>
                  <TableCell>{new Date(production.created).toLocaleString()}</TableCell>
                </TableRow>
                {result && (
                  <TableRow>
                    <TableCell sx={{ pl: 0 }}>
                      <TrophyIcon fontSize="small" color="action" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{t("Score")}</TableCell>
                    <TableCell>
                      <Typography component="span" fontWeight={600} color="primary.main">
                        {Number(result.final_score).toFixed(1)} pts
                      </Typography>
                      {' '}
                      <Typography component="span" variant="caption" color="text.secondary">
                        ({result.total_votes} {result.total_votes === 1 ? t('vote') : t('votes')})
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Description */}
            {production.description && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DescriptionIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2">{t("Description")}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', pl: 4.5 }}>
                  {production.description}
                </Typography>
              </Box>
            )}

            {/* External links */}
            {hasExternalLinks && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LinkIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2">{t("External links")}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pl: 4.5 }}>
                  <ExternalLinkButton
                    href={production.youtube_url}
                    label="YouTube"
                    icon={<YouTubeIcon fontSize="small" />}
                    color="#FF0000"
                  />
                  <ExternalLinkButton
                    href={production.demozoo_url}
                    label="Demozoo"
                    icon={<LinkIcon fontSize="small" />}
                    color="#6F9C2C"
                  />
                  <ExternalLinkButton
                    href={production.pouet_url}
                    label="Pouet"
                    icon={<LinkIcon fontSize="small" />}
                    color="#E8A317"
                  />
                  <ExternalLinkButton
                    href={production.scene_org_url}
                    label="scene.org"
                    icon={<DownloadIcon fontSize="small" />}
                  />
                </Box>
              </Box>
            )}

            {/* Files */}
            {production.files && production.files.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FileIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2">{t("Files")}</Typography>
                </Box>
                <List dense disablePadding sx={{ pl: 3.5 }}>
                  {production.files.map((file) => (
                    <ListItem
                      key={file.id}
                      disablePadding
                      secondaryAction={
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleDownload(file.id, file.original_filename)}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <FileIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.original_filename}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t("Close")}</Button>
      </DialogActions>
    </Dialog>
  );
};

const CompoCard = ({ hasCompo, results, resultsPublished, onProductionClick, t }) => {
  const [expanded, setExpanded] = useState(false);
  const hasResults = resultsPublished && results && results.length > 0;
  const navigate = useNavigate();

  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'border-color 0.2s',
      borderLeft: hasResults ? '3px solid' : 'none',
      borderColor: hasResults ? 'primary.main' : 'transparent',
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TrophyIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {hasCompo.compo_name}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, lineHeight: 1.6 }}
        >
          {hasCompo.compo_description || t('No description available')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          {hasCompo.open_to_upload ? (
            <Chip label={t("Open for submissions")} color="success" size="small" />
          ) : resultsPublished ? (
            <Chip label={t("Results published")} color="info" size="small" />
          ) : (
            <Chip label={t("Closed")} size="small" />
          )}
          {hasResults && (
            <Chip
              label={`${results.length} ${results.length === 1 ? t('production') : t('productions')}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {hasCompo.start && (
          <Typography variant="caption" display="block" color="text.secondary">
            {t("Starts")}: {new Date(hasCompo.start).toLocaleString()}
          </Typography>
        )}

        {/* Productions list when results are published */}
        {hasResults && (
          <Box sx={{ mt: 2 }}>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ mb: 1 }}
            >
              {expanded ? t('Hide results') : t('Show results')}
            </Button>
            <Collapse in={expanded}>
              <List dense disablePadding>
                {results.map((result, idx) => (
                  <React.Fragment key={result.production_id}>
                    {idx > 0 && <Divider component="li" />}
                    <ListItemButton
                      onClick={() => onProductionClick(result)}
                      sx={{
                        px: 1,
                        borderRadius: 1,
                        bgcolor: result.ranking <= 3 ? 'rgba(255, 165, 0, 0.06)' : 'transparent',
                        '&:hover': {
                          bgcolor: result.ranking <= 3 ? 'rgba(255, 165, 0, 0.12)' : 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            color: RANKING_COLORS[result.ranking] || 'text.secondary',
                            fontSize: result.ranking <= 3 ? '1rem' : '0.875rem',
                          }}
                        >
                          #{result.ranking}
                        </Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={result.production_title}
                        secondary={result.production_authors}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: result.ranking <= 3 ? 600 : 400,
                        }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      {result.final_score != null && (
                        <Typography
                          variant="caption"
                          color="primary.main"
                          fontWeight={600}
                          sx={{ ml: 1, whiteSpace: 'nowrap' }}
                        >
                          {Number(result.final_score).toFixed(1)} pts
                        </Typography>
                      )}
                    </ListItemButton>
                  </React.Fragment>
                ))}
              </List>
            </Collapse>
          </Box>
        )}
      </CardContent>

      {/* Only show submit button when open for upload */}
      {hasCompo.open_to_upload && (
        <Box sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate(`/productions/new?edition=${hasCompo.edition}&compo=${hasCompo.compo}`)}
          >
            {t("Submit Production")}
          </Button>
        </Box>
      )}
    </Card>
  );
};

const ComposList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [editions, setEditions] = useState([]);
  const [selectedEdition, setSelectedEdition] = useState(null);
  const [compos, setCompos] = useState([]);
  const [votingResults, setVotingResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Production detail dialog
  const [detailDialog, setDetailDialog] = useState({ open: false, productionId: null, result: null });

  useEffect(() => {
    fetchEditions();
  }, []);

  const fetchEditionData = useCallback(async (editionId) => {
    try {
      setLoading(true);
      const [composRes, votingRes] = await Promise.allSettled([
        editionsAPI.getCompos(editionId),
        votingResultsAPI.editionResults(editionId),
      ]);

      setCompos(composRes.status === 'fulfilled' ? composRes.value.data : []);
      setVotingResults(votingRes.status === 'fulfilled' ? votingRes.value.data : null);
    } catch (err) {
      console.error('Error fetching edition data:', err);
      setError(t('Error loading competitions'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (selectedEdition) {
      fetchEditionData(selectedEdition);
    }
  }, [selectedEdition, fetchEditionData]);

  const fetchEditions = async () => {
    try {
      const response = await editionsAPI.list({ public: true });
      const editionsList = response.data;

      if (editionsList.length > 0) {
        setEditions(editionsList);
        const openEdition = editionsList.find(e => e.open_to_upload);
        setSelectedEdition(openEdition?.id || editionsList[0].id);
      } else {
        setError(t('No editions available'));
      }
    } catch (err) {
      console.error('Error fetching editions:', err);
      setError(t('Error loading editions'));
    } finally {
      setLoading(false);
    }
  };

  const getResultsForCompo = (compoName) => {
    if (!votingResults?.results_by_compo) return [];
    return votingResults.results_by_compo[compoName] || [];
  };

  const resultsPublished = !!votingResults?.results_published_at;

  const handleProductionClick = (result) => {
    setDetailDialog({ open: true, productionId: result.production_id, result });
  };

  const handleCloseDetail = () => {
    setDetailDialog({ open: false, productionId: null, result: null });
  };

  const pageContent = loading && !selectedEdition ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  ) : (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t("Competitions")}
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {editions.length > 0 && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>{t("Edition")}</InputLabel>
          <Select
            value={selectedEdition || ''}
            onChange={(e) => setSelectedEdition(e.target.value)}
            label={t("Edition")}
          >
            {editions.map((edition) => (
              <MenuItem key={edition.id} value={edition.id}>
                {edition.title}
                <Chip
                  label={edition.open_to_upload ? t("Open") : t("Closed")}
                  size="small"
                  color={edition.open_to_upload ? "success" : "default"}
                  sx={{ ml: 1 }}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {loading && selectedEdition ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {compos.map((hasCompo) => (
            <Grid item xs={12} sm={6} md={4} key={hasCompo.id}>
              <CompoCard
                hasCompo={hasCompo}
                results={getResultsForCompo(hasCompo.compo_name)}
                resultsPublished={resultsPublished}
                onProductionClick={handleProductionClick}
                t={t}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {compos.length === 0 && !loading && !error && (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          {t("No competitions available for this edition yet.")}
        </Typography>
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

      <ProductionDetailDialog
        open={detailDialog.open}
        onClose={handleCloseDetail}
        productionId={detailDialog.productionId}
        result={detailDialog.result}
        t={t}
      />
    </Box>
  );
};

export default ComposList;
