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
  CardMedia,
  Divider,
  Alert,
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
  Image as ImageIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { LoadingSpinner, InfoField, EmptyState } from '../../components/admin/common';
import { formatDateTime } from '../../utils/dateFormatting';
import axiosWrapper from '../../utils/AxiosWrapper';

// Estilos reutilizables
const ellipsisStyle = {
  maxWidth: 300,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const imagePlaceholderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: 'grey.900',
  borderRadius: 1,
  border: '1px dashed',
  borderColor: 'grey.700',
};

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

  if (loading) {
    return (
      <AdminLayout title="Detalle de Edición">
        <LoadingSpinner />
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

            <InfoField label="Descripción" value={edition.description} />

            <InfoField
              label="Estado"
              value={
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
                    label={edition.open_to_update ? 'Actualizaciones Permitidas' : 'Actualizaciones Cerradas'}
                    color={edition.open_to_update ? 'info' : 'default'}
                    size="small"
                  />
                </Box>
              }
            />

            <InfoField label="Creado por" value={edition.uploaded_by?.email} />
            <InfoField label="Fecha de creación" value={formatDateTime(edition.created)} />
            <InfoField label="Última modificación" value={formatDateTime(edition.modified)} sx={{ mb: 0 }} />
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

        {/* Images Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Imágenes
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={3}>
              {/* Logo */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Logo
                </Typography>
                {edition.logo ? (
                  <Card sx={{ bgcolor: 'grey.900' }}>
                    <CardMedia
                      component="img"
                      image={edition.logo}
                      alt="Logo de la edición"
                      sx={{ height: 150, objectFit: 'contain', p: 1 }}
                    />
                  </Card>
                ) : (
                  <Box sx={{ height: 150, ...imagePlaceholderStyle }}>
                    <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                      <ImageIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                      <Typography variant="body2">Sin logo</Typography>
                    </Box>
                  </Box>
                )}
              </Grid>

              {/* Poster */}
              <Grid item xs={12} sm={6} md={8}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Cartel
                </Typography>
                {edition.poster ? (
                  <Card sx={{ bgcolor: 'grey.900' }}>
                    <CardMedia
                      component="img"
                      image={edition.poster}
                      alt="Cartel de la edición"
                      sx={{ height: 250, objectFit: 'contain', p: 1 }}
                    />
                  </Card>
                ) : (
                  <Box sx={{ height: 250, ...imagePlaceholderStyle }}>
                    <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                      <ImageIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                      <Typography variant="body2">Sin cartel</Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
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
                          <Typography variant="body2" color="text.secondary" sx={ellipsisStyle}>
                            {hasCompo.compo_description}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDateTime(hasCompo.start)}</TableCell>
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
              <EmptyState message="No hay competiciones asociadas a esta edición" />
            )}
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default EditionDetailPage;
