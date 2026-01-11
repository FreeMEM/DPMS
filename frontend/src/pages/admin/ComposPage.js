import React, { useState, useEffect } from 'react';
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
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { ConfirmDialog, LoadingSpinner } from '../../components/admin/common';
import axiosWrapper from '../../utils/AxiosWrapper';

const ComposPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [compos, setCompos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, compo: null });

  useEffect(() => {
    fetchCompos();
  }, []);

  const fetchCompos = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();
      const response = await client.get('/api/compos/');
      setCompos(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching compos:', err);
      setError('Error al cargar las competiciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const client = axiosWrapper();
      await client.delete(`/api/compos/${deleteDialog.compo.id}/`);
      await fetchCompos();
      setDeleteDialog({ open: false, compo: null });
    } catch (err) {
      console.error('Error deleting compo:', err);
      setError('Error al eliminar la competición');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredCompos = compos.filter((compo) =>
    compo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCompos = filteredCompos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <AdminLayout title={t("Competitions Management")}>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/compos/new')}
        >
          {t("New Competition")}
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("Name")}</TableCell>
                <TableCell>{t("Description")}</TableCell>
                <TableCell align="center">{t("Icon")}</TableCell>
                <TableCell align="center">{t("Order")}</TableCell>
                <TableCell align="center">{t("Editions")}</TableCell>
                <TableCell align="right">{t("Actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCompos.length === 0 ? (
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
                paginatedCompos.map((compo) => (
                  <TableRow key={compo.id} hover>
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
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {compo.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {compo.icon ? (
                        <Typography variant="body2" sx={{ fontSize: '1.5rem' }}>
                          {compo.icon}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={compo.display_order} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={compo.editions_count || 0}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/compos/${compo.id}`)}
                        title={t("View detail")}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/compos/${compo.id}/edit`)}
                        title={t("Edit")}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog({ open: true, compo })}
                        title={t("Delete")}
                        color="error"
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
        <TablePagination
          component="div"
          count={filteredCompos.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage={t("Rows per page:")}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t("of")} ${count}`}
        />
      </Paper>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, compo: null })}
        onConfirm={handleDelete}
        title={t("Delete Competition")}
        message={t('Are you sure you want to delete the competition "{{name}}"? This action cannot be undone.', { name: deleteDialog.compo?.name })}
      />
    </AdminLayout>
  );
};

export default ComposPage;
