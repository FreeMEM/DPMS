import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { LoadingSpinner } from '../../components/admin/common';
import { attendanceAPI, editionsAPI } from '../../services/api';

const AttendanceConfirmationsPage = () => {
  const { t, i18n } = useTranslation();
  const [editions, setEditions] = useState([]);
  const [selectedEdition, setSelectedEdition] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    editionsAPI.list()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setEditions(list);
        if (list.length > 0) {
          setSelectedEdition((prev) => prev || list[0].id);
        }
      })
      .catch(() => setError(t('Failed to load editions')));
  }, [t]);

  useEffect(() => {
    if (!selectedEdition) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    attendanceAPI.adminList(selectedEdition)
      .then((res) => {
        if (cancelled) return;
        setRows(Array.isArray(res.data) ? res.data : []);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError(t('Could not load confirmations'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedEdition, t]);

  const locale = i18n.language || 'es';
  const formatDays = (days) => {
    if (!Array.isArray(days) || days.length === 0) return '—';
    return days
      .map((d) => new Date(`${d}T00:00:00`).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
      }))
      .join(', ');
  };

  const filtered = useMemo(() => {
    if (!search) return rows;
    const needle = search.toLowerCase();
    return rows.filter((c) =>
      (c.user_email || '').toLowerCase().includes(needle) ||
      (c.user_nickname || '').toLowerCase().includes(needle) ||
      (c.user_username || '').toLowerCase().includes(needle) ||
      (c.equipment || '').toLowerCase().includes(needle)
    );
  }, [rows, search]);

  return (
    <AdminLayout
      title={t('Attendance confirmations')}
      breadcrumbs={[{ label: t('Attendance confirmations'), href: '/admin/attendance-confirmations' }]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>{t('Edition')}</InputLabel>
          <Select
            value={selectedEdition}
            label={t('Edition')}
            onChange={(e) => setSelectedEdition(e.target.value)}
          >
            {editions.map((ed) => (
              <MenuItem key={ed.id} value={ed.id}>{ed.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          placeholder={t('Search by email, nickname or equipment')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 240 }}
        />
        <Chip
          label={`${filtered.length} ${t('confirmed')}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('Nickname')}</TableCell>
                <TableCell>{t('Email')}</TableCell>
                <TableCell>{t('Sleeps at')}</TableCell>
                <TableCell>{t('Days')}</TableCell>
                <TableCell>{t('Equipment')}</TableCell>
                <TableCell>{t('Confirmed on')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.user_nickname || '—'}</TableCell>
                  <TableCell>{c.user_email}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={c.sleeps_at === 'venue' ? t('At the party') : t('Outside')}
                      color={c.sleeps_at === 'venue' ? 'secondary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatDays(c.days)}</TableCell>
                  <TableCell sx={{ maxWidth: 320 }}>
                    {c.equipment ? (
                      <Tooltip title={c.equipment} placement="top">
                        <span>
                          {c.equipment.length > 60
                            ? `${c.equipment.slice(0, 60)}…`
                            : c.equipment}
                        </span>
                      </Tooltip>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    {c.created
                      ? new Date(c.created).toLocaleDateString()
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t('No confirmations yet')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </AdminLayout>
  );
};

export default AttendanceConfirmationsPage;
