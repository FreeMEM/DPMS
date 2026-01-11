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
import AdminLayout from '../../components/admin/AdminLayout';
import { ConfirmDialog, LoadingSpinner, StatusChip } from '../../components/admin/common';
import { formatDate } from '../../utils/dateFormatting';
import axiosWrapper from '../../utils/AxiosWrapper';

const ProductionsPage = () => {
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
      <AdminLayout title="Gestión de Producciones">
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Gestión de Producciones"
      breadcrumbs={[{ label: 'Producciones', href: '#' }]}
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
              placeholder="Buscar producciones..."
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
              <InputLabel>Edición</InputLabel>
              <Select
                value={filterEdition}
                onChange={(e) => setFilterEdition(e.target.value)}
                label="Edición"
              >
                <MenuItem value="">Todas</MenuItem>
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
              <InputLabel>Competición</InputLabel>
              <Select
                value={filterCompo}
                onChange={(e) => setFilterCompo(e.target.value)}
                label="Competición"
              >
                <MenuItem value="">Todas</MenuItem>
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
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pending">Pendiente</MenuItem>
                <MenuItem value="approved">Aprobada</MenuItem>
                <MenuItem value="rejected">Rechazada</MenuItem>
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
                <TableCell>Título</TableCell>
                <TableCell>Autores</TableCell>
                <TableCell>Edición</TableCell>
                <TableCell>Competición</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Ranking</TableCell>
                <TableCell>Enviado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProductions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      {searchTerm || filterEdition || filterCompo || filterStatus
                        ? 'No se encontraron producciones'
                        : 'No hay producciones enviadas'}
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
                        title="Ver detalle"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog({ open: true, production })}
                        title="Eliminar"
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
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, production: null })}
        onConfirm={handleDelete}
        title="Eliminar Producción"
        message={`¿Estás seguro de que deseas eliminar la producción "${deleteDialog.production?.title}"? Esta acción no se puede deshacer.`}
      />
    </AdminLayout>
  );
};

export default ProductionsPage;
