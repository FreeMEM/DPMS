import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  CheckCircle as UsedIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import axiosWrapper from '../../utils/AxiosWrapper';

const AttendanceCodesPage = () => {
  const [codes, setCodes] = useState([]);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generateDialog, setGenerateDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filterEdition, setFilterEdition] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [generateForm, setGenerateForm] = useState({
    edition: '',
    count: 10,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();
      const [codesRes, editionsRes] = await Promise.all([
        client.get('/api/attendance-codes/'),
        client.get('/api/editions/'),
      ]);
      setCodes(codesRes.data);
      setEditions(editionsRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los códigos de asistencia');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const client = axiosWrapper();
      await client.post('/api/attendance-codes/generate/', generateForm);
      setSuccess(`${generateForm.count} códigos generados exitosamente`);
      await fetchData();
      setGenerateDialog(false);
      setGenerateForm({ edition: '', count: 10 });
    } catch (err) {
      console.error('Error generating codes:', err);
      setError('Error al generar códigos');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    try {
      const client = axiosWrapper();
      const params = new URLSearchParams();
      if (filterEdition) params.append('edition', filterEdition);
      if (filterStatus) params.append('used', filterStatus === 'used');

      const response = await client.get(`/api/attendance-codes/export/?${params.toString()}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_codes_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting codes:', err);
      setError('Error al exportar códigos');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredCodes = codes.filter((code) => {
    const matchesEdition = !filterEdition || code.edition === parseInt(filterEdition, 10);
    const matchesStatus =
      !filterStatus ||
      (filterStatus === 'used' && code.used) ||
      (filterStatus === 'unused' && !code.used);
    return matchesEdition && matchesStatus;
  });

  const paginatedCodes = filteredCodes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <AdminLayout title="Códigos de Asistencia">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Códigos de Asistencia"
      breadcrumbs={[{ label: 'Códigos de Asistencia', href: '#' }]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Actions and Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
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
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="unused">No usados</MenuItem>
                <MenuItem value="used">Usados</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Exportar CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setGenerateDialog(true)}
            >
              Generar Códigos
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {codes.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Códigos
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {codes.filter((c) => c.used).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Usados
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {codes.filter((c) => !c.used).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Disponibles
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {codes.length > 0
                ? ((codes.filter((c) => c.used).length / codes.length) * 100).toFixed(1)
                : 0}
              %
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tasa de Uso
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Codes Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Edición</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell>Usado Por</TableCell>
                <TableCell>Fecha Uso</TableCell>
                <TableCell>Creado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      {filterEdition || filterStatus
                        ? 'No se encontraron códigos'
                        : 'No hay códigos. Genera nuevos códigos para comenzar.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCodes.map((code) => (
                  <TableRow key={code.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                        {code.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {editions.find((e) => e.id === code.edition)?.title || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {code.used ? (
                        <Chip
                          label="Usado"
                          color="success"
                          size="small"
                          icon={<UsedIcon fontSize="small" />}
                        />
                      ) : (
                        <Chip label="Disponible" color="warning" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {code.used_by?.email || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(code.used_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(code.created)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredCodes.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Generate Dialog */}
      <Dialog open={generateDialog} onClose={() => setGenerateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generar Códigos de Asistencia</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Edición</InputLabel>
                <Select
                  value={generateForm.edition}
                  onChange={(e) => setGenerateForm({ ...generateForm, edition: e.target.value })}
                  label="Edición"
                >
                  {editions.map((edition) => (
                    <MenuItem key={edition.id} value={edition.id}>
                      {edition.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Cantidad de Códigos"
                value={generateForm.count}
                onChange={(e) =>
                  setGenerateForm({ ...generateForm, count: parseInt(e.target.value, 10) || 1 })
                }
                inputProps={{ min: 1, max: 1000 }}
                helperText="Máximo 1000 códigos por generación"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog(false)} disabled={generating}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            variant="contained"
            disabled={generating || !generateForm.edition}
          >
            {generating ? 'Generando...' : 'Generar'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AttendanceCodesPage;
