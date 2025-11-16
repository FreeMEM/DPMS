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
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmDialog from '../../components/admin/common/ConfirmDialog';
import axiosWrapper from '../../utils/AxiosWrapper';

const ComposPage = () => {
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
      <AdminLayout title="Gestión de Competiciones">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Gestión de Competiciones"
      breadcrumbs={[{ label: 'Competiciones', href: '#' }]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          placeholder="Buscar competiciones..."
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
          Nueva Competición
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="center">Icono</TableCell>
                <TableCell align="center">Orden</TableCell>
                <TableCell align="center">Ediciones</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCompos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      {searchTerm
                        ? 'No se encontraron competiciones'
                        : 'No hay competiciones. Crea una nueva para comenzar.'}
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
                        title="Ver detalle"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/compos/${compo.id}/edit`)}
                        title="Editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog({ open: true, compo })}
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
          count={filteredCompos.length}
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
        onClose={() => setDeleteDialog({ open: false, compo: null })}
        onConfirm={handleDelete}
        title="Eliminar Competición"
        message={`¿Estás seguro de que deseas eliminar la competición "${deleteDialog.compo?.name}"? Esta acción no se puede deshacer.`}
      />
    </AdminLayout>
  );
};

export default ComposPage;
