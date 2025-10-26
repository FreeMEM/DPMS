import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { productionsAPI, filesAPI } from '../../services/api';
import { AuthContext } from '../../AuthContext';

const ProductionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [production, setProduction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState({});

  const fetchProduction = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productionsAPI.get(id);
      setProduction(response.data);
    } catch (err) {
      console.error('Error fetching production:', err);
      setError('Error loading production details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduction();
  }, [fetchProduction]);

  const handleDownload = async (file) => {
    try {
      setDownloading(prev => ({ ...prev, [file.id]: true }));

      const response = await filesAPI.download(file.id);

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.original_filename || file.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Error downloading file');
    } finally {
      setDownloading(prev => ({ ...prev, [file.id]: false }));
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOwner = user && production && production.uploaded_by === user.email;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !production) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Production not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        {isOwner && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/productions/edit/${production.id}`)}
          >
            Edit
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {production.title}
        </Typography>

        <Typography variant="h6" color="text.secondary" gutterBottom>
          By {production.authors}
        </Typography>

        <Box sx={{ my: 3 }}>
          <Chip
            label={production.edition_title}
            color="primary"
            sx={{ mr: 1, mb: 1 }}
          />
          <Chip
            label={production.compo_name}
            variant="outlined"
            sx={{ mb: 1 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {production.description && (
          <>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              {production.description}
            </Typography>
            <Divider sx={{ my: 3 }} />
          </>
        )}

        <Typography variant="h6" gutterBottom>
          Files
        </Typography>

        {production.files && production.files.length > 0 ? (
          <List>
            {production.files.map((file) => (
              <ListItem
                key={file.id}
                divider
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleDownload(file)}
                    disabled={downloading[file.id]}
                  >
                    {downloading[file.id] ? (
                      <CircularProgress size={24} />
                    ) : (
                      <DownloadIcon />
                    )}
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <FileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={file.title || file.original_filename}
                  secondary={
                    <>
                      {file.original_filename && file.original_filename !== file.title && (
                        <>
                          {file.original_filename}
                          <br />
                        </>
                      )}
                      {file.size && formatFileSize(file.size)}
                      {file.public && (
                        <Chip
                          label="Public"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No files attached to this production.
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Submitted: {formatDate(production.created)}
            </Typography>
            {production.modified !== production.created && (
              <Typography variant="caption" color="text.secondary" display="block">
                Last modified: {formatDate(production.modified)}
              </Typography>
            )}
          </Box>
          {production.uploaded_by && (
            <Typography variant="caption" color="text.secondary">
              By: {production.uploaded_by}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductionDetail;
