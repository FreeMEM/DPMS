import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  CloudUpload as UploadIcon,
  HowToVote as VoteIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/common/StatsCard';
import axiosWrapper from '../../utils/AxiosWrapper';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEditions: 0,
    totalProductions: 0,
    totalVotes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();

      // Fetch basic stats - only use endpoints that exist
      const [editionsRes, productionsRes, votesRes] = await Promise.all([
        client.get('/api/editions/').catch(() => ({ data: [] })),
        client.get('/api/productions/').catch(() => ({ data: [] })),
        client.get('/api/votes/').catch(() => ({ data: [] })),
      ]);

      setStats({
        totalUsers: 0, // TODO: Implement users endpoint
        totalEditions: editionsRes.data?.length || 0,
        totalProductions: productionsRes.data?.length || 0,
        totalVotes: votesRes.data?.length || 0,
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Panel de Administración">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Usuarios Registrados"
            value={loading ? '...' : stats.totalUsers}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Ediciones"
            value={loading ? '...' : stats.totalEditions}
            icon={<TrophyIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Producciones"
            value={loading ? '...' : stats.totalProductions}
            icon={<UploadIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Votos Emitidos"
            value={loading ? '...' : stats.totalVotes}
            icon={<VoteIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Welcome Card */}
      <Card>
        <CardHeader title="Bienvenido al Panel de Administración" />
        <CardContent>
          <Typography variant="body1" paragraph>
            Desde aquí puedes gestionar todos los aspectos del sistema DPMS:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Ediciones:</strong> Crear y gestionar ediciones de parties
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Competiciones:</strong> Configurar tipos de competiciones (compos)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Producciones:</strong> Ver y gestionar producciones enviadas
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Usuarios:</strong> Administrar usuarios y asignar roles
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Votaciones:</strong> Configurar sistema de votación con jurado y códigos de asistencia
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
