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
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import axiosWrapper from '../../utils/AxiosWrapper';

const CompoDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [compo, setCompo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompo();
  }, [id]);

  const fetchCompo = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();
      const response = await client.get(`/api/compos/${id}/`);
      setCompo(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching compo:', err);
      setError('Error al cargar la competición');
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
      <AdminLayout title="Detalle de Competición">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error || !compo) {
    return (
      <AdminLayout title="Detalle de Competición">
        <Alert severity="error">{error || 'Competición no encontrada'}</Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={compo.name}
      breadcrumbs={[
        { label: 'Competiciones', href: '/app/admin/compos' },
        { label: compo.name, href: '#' },
      ]}
    >
      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/app/admin/compos')}
        >
          Volver
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/app/admin/compos/${id}/edit`)}
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
                Nombre
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                {compo.icon && (
                  <Typography variant="h6" component="span">
                    {compo.icon}
                  </Typography>
                )}
                <Typography variant="body1" fontWeight={600}>
                  {compo.name}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Descripción
              </Typography>
              <Typography variant="body1">{compo.description || '-'}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Reglas
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  bgcolor: 'background.default',
                  p: 2,
                  borderRadius: 1,
                  mt: 1,
                }}
              >
                {compo.rules || 'No hay reglas especificadas'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Orden de visualización
              </Typography>
              <Typography variant="body1">
                <Chip label={compo.display_order} size="small" variant="outlined" />
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Fecha de creación
              </Typography>
              <Typography variant="body1">{formatDate(compo.created)}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Última modificación
              </Typography>
              <Typography variant="body1">{formatDate(compo.modified)}</Typography>
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
                  {compo.editions_count || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ediciones
                </Typography>
              </Box>

              <Box>
                <Typography variant="h3" color="primary">
                  {compo.productions_count || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Producciones Totales
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Editions Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ediciones con esta Competición
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {compo.hascompo_set && compo.hascompo_set.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Edición</TableCell>
                      <TableCell>Fecha Inicio</TableCell>
                      <TableCell align="center">Envíos</TableCell>
                      <TableCell align="center">Actualizar</TableCell>
                      <TableCell align="center">Mostrar Autores</TableCell>
                      <TableCell align="center">Producciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {compo.hascompo_set.map((hasCompo) => (
                      <TableRow key={hasCompo.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {hasCompo.edition_title}
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
                            label={hasCompo.open_to_update ? 'Sí' : 'No'}
                            color={hasCompo.open_to_update ? 'info' : 'default'}
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
                        <TableCell align="center">
                          <Chip
                            label={hasCompo.productions_count || 0}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                Esta competición no está asociada a ninguna edición
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default CompoDetailPage;
