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
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { LoadingSpinner } from '../../components/admin/common';
import { editionsAPI, usersAPI } from '../../services/api';

const UsersPage = () => {
  const { t } = useTranslation();
  const [editions, setEditions] = useState([]);
  const [selectedEdition, setSelectedEdition] = useState('');
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(null);
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
    usersAPI.adminList(selectedEdition)
      .then((res) => {
        if (cancelled) return;
        const payload = res.data || {};
        setUsers(Array.isArray(payload.results) ? payload.results : []);
        setTotalCount(payload.total_count || 0);
        setConfirmedCount(
          payload.confirmed_count === undefined ? null : payload.confirmed_count
        );
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError(t('Could not load users'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedEdition, t]);

  const filtered = useMemo(() => {
    if (!search) return users;
    const needle = search.toLowerCase();
    return users.filter((u) =>
      (u.email || '').toLowerCase().includes(needle) ||
      (u.nickname || '').toLowerCase().includes(needle) ||
      (u.first_name || '').toLowerCase().includes(needle) ||
      (u.last_name || '').toLowerCase().includes(needle)
    );
  }, [users, search]);

  return (
    <AdminLayout
      title={t('Users')}
      breadcrumbs={[{ label: t('Users'), href: '/admin/users' }]}
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
          placeholder={t('Search by name, email or nickname')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 240 }}
        />
        {confirmedCount !== null && (
          <Chip
            label={`${confirmedCount} / ${totalCount} ${t('confirmed')}`}
            color="primary"
            variant="outlined"
          />
        )}
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
                <TableCell>{t('Name')}</TableCell>
                <TableCell align="center">{t('Verified')}</TableCell>
                <TableCell align="center">{t('Attends')}</TableCell>
                <TableCell>{t('Joined')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.nickname || '—'}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}
                  </TableCell>
                  <TableCell align="center">
                    {u.is_verified
                      ? <CheckIcon fontSize="small" color="success" />
                      : <CloseIcon fontSize="small" color="disabled" />}
                  </TableCell>
                  <TableCell align="center">
                    {u.attends === true && (
                      <Chip size="small" label={t('Yes')} color="success" />
                    )}
                    {u.attends === false && (
                      <Chip size="small" label={t('No')} variant="outlined" />
                    )}
                    {u.attends === null && '—'}
                  </TableCell>
                  <TableCell>
                    {u.date_joined
                      ? new Date(u.date_joined).toLocaleDateString()
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t('No users match your filter')}
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

export default UsersPage;
