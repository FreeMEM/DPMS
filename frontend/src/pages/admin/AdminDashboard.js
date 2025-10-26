import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Alert,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  CloudUpload as UploadIcon,
  HowToVote as VoteIcon,
  Settings as SettingsIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/common/StatsCard';
import axiosWrapper from '../../utils/AxiosWrapper';

const AdminDashboard = () => {
  const navigate = useNavigate();
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

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TrophyIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6">Ediciones</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Crear y gestionar ediciones de parties
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/app/admin/editions')}
              >
                Gestionar Ediciones
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CategoryIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6">Competiciones</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configurar tipos de competiciones (compos)
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/app/admin/compos')}
              >
                Gestionar Compos
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <SettingsIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6">Votaciones</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configurar sistema de votación y jurados
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/app/admin/voting')}
              >
                Configurar Votación
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Welcome Card */}
      <Card>
        <CardHeader title="Bienvenido al Panel de Administración" />
        <CardContent>
          <Typography variant="body1">
            Gestiona todos los aspectos del sistema DPMS desde este panel centralizado.
          </Typography>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
