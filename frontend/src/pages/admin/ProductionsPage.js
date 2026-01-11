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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { ConfirmDialog, LoadingSpinner, StatusChip } from '../../components/admin/common';
import { formatDate } from '../../utils/dateFormatting';
import axiosWrapper from '../../utils/AxiosWrapper';

const ProductionsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [productions, setProductions] = useState([]);
  const [editions, setEditions] = useState([]);
  const [compos, setCompos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEdition, setFilterEdition] = useState('');
  const [filterCompo, setFilterCompo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, production: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();
      const [productionsRes, editionsRes, composRes] = await Promise.all([
        client.get('/api/productions/'),
        client.get('/api/editions/'),
        client.get('/api/compos/'),
      ]);
      setProductions(productionsRes.data);
      setEditions(editionsRes.data);
      setCompos(composRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar las producciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const client = axiosWrapper();
      await client.delete(`/api/productions/${deleteDialog.production.id}/`);
      await fetchData();
      setDeleteDialog({ open: false, production: null });
    } catch (err) {
      console.error('Error deleting production:', err);
      setError('Error al eliminar la producción');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredProductions = productions.filter((production) => {
    const matchesSearch = production.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEdition = !filterEdition || production.edition === parseInt(filterEdition, 10);
    const matchesCompo = !filterCompo || production.compo === parseInt(filterCompo, 10);
    const matchesStatus = !filterStatus || production.status === filterStatus;
    return matchesSearch && matchesEdition && matchesCompo && matchesStatus;
  });

  const paginatedProductions = filteredProductions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <AdminLayout title={t("Productions Management")}>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t("Productions Management")}
      breadcrumbs={[{ label: t('Productions'), href: '#' }]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder={t("Search productions...")}
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
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Edition")}</InputLabel>
              <Select
                value={filterEdition}
                onChange={(e) => setFilterEdition(e.target.value)}
                label={t("Edition")}
              >
                <MenuItem value="">{t("All")}</MenuItem>
                {editions.map((edition) => (
                  <MenuItem key={edition.id} value={edition.id}>
                    {edition.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Competition")}</InputLabel>
              <Select
                value={filterCompo}
                onChange={(e) => setFilterCompo(e.target.value)}
                label={t("Competition")}
              >
                <MenuItem value="">{t("All")}</MenuItem>
                {compos.map((compo) => (
                  <MenuItem key={compo.id} value={compo.id}>
                    {compo.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Status")}</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label={t("Status")}
              >
                <MenuItem value="">{t("All")}</MenuItem>
                <MenuItem value="pending">{t("Pending")}</MenuItem>
                <MenuItem value="approved">{t("Approved")}</MenuItem>
                <MenuItem value="rejected">{t("Rejected")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("Title")}</TableCell>
                <TableCell>{t("Authors")}</TableCell>
                <TableCell>{t("Edition")}</TableCell>
                <TableCell>{t("Competition")}</TableCell>
                <TableCell align="center">{t("Status")}</TableCell>
                <TableCell align="center">{t("Ranking")}</TableCell>
                <TableCell>{t("Submitted")}</TableCell>
                <TableCell align="right">{t("Actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProductions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      {searchTerm || filterEdition || filterCompo || filterStatus
                        ? t('No productions found')
                        : t('No productions yet.')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProductions.map((production) => (
                  <TableRow key={production.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {production.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {production.authors || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {editions.find((e) => e.id === production.edition)?.title || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {compos.find((c) => c.id === production.compo)?.name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center"><StatusChip status={production.status} /></TableCell>
                    <TableCell align="center">
                      {production.ranking ? (
                        <Chip
                          label={`#${production.ranking}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(production.created)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/app/admin/productions/${production.id}`)}
                        title={t("View detail")}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog({ open: true, production })}
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
          count={filteredProductions.length}
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
        onClose={() => setDeleteDialog({ open: false, production: null })}
        onConfirm={handleDelete}
        title={t("Delete Production")}
        message={t('Are you sure you want to delete the production "{{title}}"? This action cannot be undone.', { title: deleteDialog.production?.title })}
      />
    </AdminLayout>
  );
};

export default ProductionsPage;
