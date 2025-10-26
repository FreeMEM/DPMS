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
import { productionsAPI } from '../../services/api';
import MainBar from '../../@dpms-freemem/MainBar';
import Content from '../../@dpms-freemem/Content';

const MyProductions = () => {
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
      setError('Error loading your productions');
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
          My Productions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/compos')}
        >
          Submit New Production
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
            No productions yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            You haven't submitted any productions yet. Start by choosing a competition!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/compos')}
          >
            Browse Competitions
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
                      sx={{ mb: 1 }}
                    />
                  </Box>

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
                      Files: {production.files_count || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Submitted: {formatDate(production.created)}
                    </Typography>
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleView(production.id)}
                    title="View details"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEdit(production.id)}
                    title="Edit production"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(production)}
                    title="Delete production"
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
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{productionToDelete?.title}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleting}
            autoFocus
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <Box>
      <MainBar />
      <Content>
        {pageContent}
      </Content>
    </Box>
  );
};

export default MyProductions;
