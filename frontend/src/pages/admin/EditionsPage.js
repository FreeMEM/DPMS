import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  Alert,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { ConfirmDialog, LoadingSpinner } from '../../components/admin/common';
import { formatDate } from '../../utils/dateFormatting';
import axiosWrapper from '../../utils/AxiosWrapper';

const EditionsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [editions, setEditions] = useState([]);
  const [filteredEditions, setFilteredEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, edition: null });

  useEffect(() => {
    fetchEditions();
  }, []);

  useEffect(() => {
    // Filter editions based on search term
    if (searchTerm) {
      const filtered = editions.filter((edition) =>
        edition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        edition.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEditions(filtered);
    } else {
      setFilteredEditions(editions);
    }
  }, [searchTerm, editions]);

  const fetchEditions = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();
      const response = await client.get('/api/editions/');
      setEditions(response.data);
      setFilteredEditions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching editions:', err);
      setError('Error al cargar las ediciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const client = axiosWrapper();
      await client.delete(`/api/editions/${deleteDialog.edition.id}/`);
      setDeleteDialog({ open: false, edition: null });
      fetchEditions(); // Refresh list
    } catch (err) {
      console.error('Error deleting edition:', err);
      setError('Error al eliminar la edición');
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t("Editions Management")}>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t("Editions Management")}
      breadcrumbs={[{ label: t('Editions'), href: '/admin/editions' }]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder={t("Search editions...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/editions/new')}
        >
          {t("New Edition")}
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("Title")}</TableCell>
              <TableCell>{t("Description")}</TableCell>
              <TableCell align="center">{t("Public")}</TableCell>
              <TableCell align="center">{t("Open Submissions")}</TableCell>
              <TableCell align="center">{t("Compos")}</TableCell>
              <TableCell align="center">{t("Productions")}</TableCell>
              <TableCell>{t("Created")}</TableCell>
              <TableCell align="right">{t("Actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEditions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    {searchTerm
                      ? t('No editions found')
                      : t('No editions. Create a new one to get started.')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredEditions.map((edition) => (
                <TableRow key={edition.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {edition.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {edition.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={edition.public ? t('Yes') : t('No')}
                      color={edition.public ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={edition.open_to_upload ? t('Open') : t('Closed')}
                      color={edition.open_to_upload ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={edition.compos_count || 0} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={edition.productions_count || 0} size="small" />
                  </TableCell>
                  <TableCell>{formatDate(edition.created)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/editions/${edition.id}`)}
                      title={t("View detail")}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/editions/${edition.id}/edit`)}
                      title={t("Edit")}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, edition })}
                      title={t("Delete")}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title={t("Delete Edition")}
        message={t('Are you sure you want to delete the edition "{{title}}"? This action cannot be undone.', { title: deleteDialog.edition?.title })}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, edition: null })}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
      />
    </AdminLayout>
  );
};

export default EditionsPage;
