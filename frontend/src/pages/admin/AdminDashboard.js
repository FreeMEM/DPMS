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
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/common/StatsCard';
import axiosWrapper from '../../utils/AxiosWrapper';

const AdminDashboard = () => {
  const { t } = useTranslation();
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
    <AdminLayout title={t("Administration Panel")}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title={t("Registered Users")}
            value={loading ? '...' : stats.totalUsers}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title={t("Editions")}
            value={loading ? '...' : stats.totalEditions}
            icon={<TrophyIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title={t("Productions")}
            value={loading ? '...' : stats.totalProductions}
            icon={<UploadIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title={t("Votes Cast")}
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
                <Typography variant="h6">{t("Editions")}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t("Create and manage party editions")}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/admin/editions')}
              >
                {t("Manage Editions")}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CategoryIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6">{t("Competitions")}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t("Configure competition types (compos)")}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/admin/compos')}
              >
                {t("Manage Compos")}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <SettingsIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6">{t("Voting")}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t("Configure voting system and juries")}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/admin/voting')}
              >
                {t("Configure Voting")}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Welcome Card */}
      <Card>
        <CardHeader title={t("Welcome to Administration Panel")} />
        <CardContent>
          <Typography variant="body1">
            {t("Manage all aspects of DPMS system from this centralized panel.")}
          </Typography>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
