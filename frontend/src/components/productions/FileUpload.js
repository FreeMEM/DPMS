import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const FileUpload = ({ onFilesChanged, initialFiles = [] }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [existingFiles] = useState(initialFiles);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    setError(null);

    // Validate file sizes
    for (const file of selectedFiles) {
      if (file.size > 100 * 1024 * 1024) {
        setError(`File ${file.name} exceeds 100MB limit`);
        return;
      }
    }

    const newPending = [...pendingFiles, ...selectedFiles];
    setPendingFiles(newPending);

    if (onFilesChanged) {
      onFilesChanged({
        existingFileIds: existingFiles.map(f => f.id),
        newFiles: newPending,
      });
    }

    // Reset input so selecting the same file again works
    event.target.value = '';
  };

  const handleRemovePending = (index) => {
    const newPending = pendingFiles.filter((_, i) => i !== index);
    setPendingFiles(newPending);

    if (onFilesChanged) {
      onFilesChanged({
        existingFileIds: existingFiles.map(f => f.id),
        newFiles: newPending,
      });
    }
  };

  const handleRemoveExisting = (fileId) => {
    const newExisting = existingFiles.filter(f => f.id !== fileId);
    if (onFilesChanged) {
      onFilesChanged({
        existingFileIds: newExisting.map(f => f.id),
        newFiles: pendingFiles,
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const totalFiles = existingFiles.length + pendingFiles.length;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("Files")}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <input
        accept="*/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple
        type="file"
        onChange={handleFileSelect}
      />
      <Button
        type="button"
        variant="contained"
        startIcon={<UploadIcon />}
        onClick={() => fileInputRef.current?.click()}
        sx={{ mb: 2 }}
      >
        {t("Upload Files")}
      </Button>

      {totalFiles > 0 && (
        <List>
          {/* Existing files (already uploaded, e.g. when editing) */}
          {existingFiles.map((file) => (
            <ListItem key={`existing-${file.id}`} divider>
              <ListItemText
                primary={file.title || file.original_filename}
                secondary={file.size ? formatFileSize(file.size) : null}
                secondaryTypographyProps={{ component: 'div' }}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleRemoveExisting(file.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {/* Pending files (selected but not yet uploaded) */}
          {pendingFiles.map((file, index) => (
            <ListItem key={`pending-${index}`} divider>
              <ListItemText
                primary={file.name}
                secondary={formatFileSize(file.size)}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleRemovePending(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {totalFiles === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t("No files uploaded yet. Max file size: 100MB per file.")}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;
