import React, { useState, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productionsAPI } from '../../services/api';
import MainBar from '../../@dpms-freemem/MainBar';
import ThreeBackground from '../common/ThreeBackground';
import BackgroundToggle from '../common/BackgroundToggle';

const MyProductions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productionToDelete, setProductionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    try {
      setLoading(true);
      const response = await productionsAPI.myProductions();
      setProductions(response.data);
    } catch (err) {
      console.error('Error fetching productions:', err);
      setError(t('Error loading your productions'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (productionId) => {
    navigate(`/productions/edit/${productionId}`);
  };

  const handleView = (productionId) => {
    navigate(`/productions/${productionId}`);
  };

  const handleDeleteClick = (production) => {
    setProductionToDelete(production);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productionToDelete) return;

    try {
      setDeleting(true);
      await productionsAPI.delete(productionToDelete.id);

      // Remove from local state
      setProductions(prev => prev.filter(p => p.id !== productionToDelete.id));

      setDeleteDialogOpen(false);
      setProductionToDelete(null);
    } catch (err) {
      console.error('Error deleting production:', err);
      setError(err.response?.data?.detail || 'Error deleting production');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductionToDelete(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const pageContent = loading ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  ) : (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {t("My Productions")}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/compos')}
        >
          {t("Submit New Production")}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {productions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("No productions yet")}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t("You haven't submitted any productions yet. Start by choosing a competition!")}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/compos')}
          >
            {t("Browse Competitions")}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {productions.map((production) => (
            <Grid item xs={12} md={6} lg={4} key={production.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {production.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    By {production.authors}
                  </Typography>

                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Chip
                      label={production.edition_title}
                      size="small"
                      color="primary"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      label={production.compo_name}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    {production.status && (
                      <Chip
                        label={production.status === 'approved' ? t('Approved') : production.status === 'rejected' ? t('Rejected') : t('Pending')}
                        size="small"
                        color={production.status === 'approved' ? 'success' : production.status === 'rejected' ? 'error' : 'warning'}
                        sx={{ mb: 1 }}
                      />
                    )}
                  </Box>
                  {production.status === 'rejected' && production.rejection_reason && (
                    <Alert severity="error" sx={{ mb: 1, py: 0 }} variant="outlined">
                      <Typography variant="caption">
                        {production.rejection_reason === 'technical' ? 'No cumple requisitos técnicos' :
                         production.rejection_reason === 'inappropriate' ? 'Contenido inapropiado' :
                         production.rejection_reason === 'wrong_compo' ? 'Compo incorrecta' :
                         production.rejection_reason === 'duplicate' ? 'Duplicado' : 'Otro'}
                        {production.rejection_notes ? `: ${production.rejection_notes}` : ''}
                      </Typography>
                    </Alert>
                  )}

                  {production.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {production.description}
                    </Typography>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t("Files:")} {production.files_count || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {t("Submitted:")} {formatDate(production.created)}
                    </Typography>
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleView(production.id)}
                    title={t("View details")}
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEdit(production.id)}
                    title={t("Edit production")}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(production)}
                    title={t("Delete production")}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          {t("Confirm Delete")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("Are you sure you want to delete this production? This action cannot be undone.")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleting}
            autoFocus
          >
            {deleting ? t('Deleting...') : t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
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
    </Box>
  );
};

export default MyProductions;
