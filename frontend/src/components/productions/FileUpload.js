import React, { useState } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  LinearProgress,
  Alert,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { filesAPI } from '../../services/api';

const FileUpload = ({ onFilesUploaded, initialFiles = [] }) => {
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileSelect = async (event) => {
    const selectedFiles = Array.from(event.target.files);

    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadedFiles = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Check file size (100MB max)
        if (file.size > 100 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 100MB limit`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        formData.append('description', '');
        formData.append('public', 'false');

        const response = await filesAPI.upload(formData);
        uploadedFiles.push(response.data);

        // Update progress
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      const newFiles = [...files, ...uploadedFiles];
      setFiles(newFiles);

      // Notify parent component with file IDs
      if (onFilesUploaded) {
        onFilesUploaded(newFiles.map(f => f.id));
      }

      // Reset progress
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.file?.[0] || err.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (fileId) => {
    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);

    if (onFilesUploaded) {
      onFilesUploaded(newFiles.map(f => f.id));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Files
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <input
        accept="*/*"
        style={{ display: 'none' }}
        id="file-upload-button"
        multiple
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      <label htmlFor="file-upload-button">
        <Button
          variant="contained"
          component="span"
          startIcon={<UploadIcon />}
          disabled={uploading}
          sx={{ mb: 2 }}
        >
          {uploading ? 'Uploading...' : 'Upload Files'}
        </Button>
      </label>

      {uploading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" sx={{ mt: 0.5 }}>
            {Math.round(uploadProgress)}% uploaded
          </Typography>
        </Box>
      )}

      {files.length > 0 && (
        <List>
          {files.map((file) => (
            <ListItem key={file.id} divider>
              <ListItemText
                primary={file.title || file.original_filename}
                secondary={
                  <>
                    {file.original_filename && file.original_filename !== file.title && (
                      <Typography component="span" variant="body2">
                        {file.original_filename}
                        <br />
                      </Typography>
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
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveFile(file.id)}
                  disabled={uploading}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {files.length === 0 && !uploading && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No files uploaded yet. Max file size: 100MB per file.
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;
