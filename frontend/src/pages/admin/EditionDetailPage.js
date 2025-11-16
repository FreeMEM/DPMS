import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import axiosWrapper from '../../utils/AxiosWrapper';

const EditionDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [edition, setEdition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEdition();
  }, [id]);

  const fetchEdition = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();
      const response = await client.get(`/api/editions/${id}/`);
      setEdition(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching edition:', err);
      setError('Error al cargar la edición');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Detalle de Edición">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error || !edition) {
    return (
      <AdminLayout title="Detalle de Edición">
        <Alert severity="error">{error || 'Edición no encontrada'}</Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={edition.title}
      breadcrumbs={[
        { label: 'Ediciones', href: '/admin/editions' },
        { label: edition.title, href: '#' },
      ]}
    >
      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/admin/editions')}
        >
          Volver
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/admin/editions/${id}/edit`)}
        >
          Editar
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Info Card */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información General
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Descripción
              </Typography>
              <Typography variant="body1">{edition.description || '-'}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Estado
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  label={edition.public ? 'Pública' : 'Privada'}
                  color={edition.public ? 'success' : 'default'}
                  size="small"
                />
                <Chip
                  label={edition.open_to_upload ? 'Envíos Abiertos' : 'Envíos Cerrados'}
                  color={edition.open_to_upload ? 'success' : 'error'}
                  size="small"
                />
                <Chip
                  label={
                    edition.open_to_update
                      ? 'Actualizaciones Permitidas'
                      : 'Actualizaciones Cerradas'
                  }
                  color={edition.open_to_update ? 'info' : 'default'}
                  size="small"
                />
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Creado por
              </Typography>
              <Typography variant="body1">
                {edition.uploaded_by?.email || '-'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Fecha de creación
              </Typography>
              <Typography variant="body1">{formatDate(edition.created)}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Última modificación
              </Typography>
              <Typography variant="body1">{formatDate(edition.modified)}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Stats Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estadísticas
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" color="primary">
                  {edition.compos_count || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Competiciones
                </Typography>
              </Box>

              <Box>
                <Typography variant="h3" color="primary">
                  {edition.productions_count || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Producciones
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Compos Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Competiciones Asociadas</Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/admin/editions/${id}/add-compo`)}
              >
                Añadir Compo
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {edition.hascompo_set && edition.hascompo_set.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Competición</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Fecha Inicio</TableCell>
                      <TableCell align="center">Envíos</TableCell>
                      <TableCell align="center">Mostrar Autores</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {edition.hascompo_set.map((hasCompo) => (
                      <TableRow key={hasCompo.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {hasCompo.compo_name}
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
                            {hasCompo.compo_description}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(hasCompo.start)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={hasCompo.open_to_upload ? 'Abierto' : 'Cerrado'}
                            color={hasCompo.open_to_upload ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={hasCompo.show_authors_on_slide ? 'Sí' : 'No'}
                            color={hasCompo.show_authors_on_slide ? 'info' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                No hay competiciones asociadas a esta edición
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default EditionDetailPage;
