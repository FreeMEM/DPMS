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
  CircularProgress,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmDialog from '../../components/admin/common/ConfirmDialog';
import axiosWrapper from '../../utils/AxiosWrapper';

const EditionsPage = () => {
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Gestión de Ediciones">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Gestión de Ediciones"
      breadcrumbs={[{ label: 'Ediciones', href: '/admin/editions' }]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Buscar ediciones..."
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
          Nueva Edición
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="center">Pública</TableCell>
              <TableCell align="center">Abierta Envíos</TableCell>
              <TableCell align="center">Compos</TableCell>
              <TableCell align="center">Producciones</TableCell>
              <TableCell>Creada</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEditions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    {searchTerm
                      ? 'No se encontraron ediciones'
                      : 'No hay ediciones. Crea una nueva para empezar.'}
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
                      label={edition.public ? 'Sí' : 'No'}
                      color={edition.public ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={edition.open_to_upload ? 'Abierta' : 'Cerrada'}
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
                      title="Ver detalle"
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/editions/${edition.id}/edit`)}
                      title="Editar"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, edition })}
                      title="Eliminar"
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
        title="Eliminar Edición"
        message={`¿Estás seguro de que quieres eliminar la edición "${deleteDialog.edition?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, edition: null })}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </AdminLayout>
  );
};

export default EditionsPage;
