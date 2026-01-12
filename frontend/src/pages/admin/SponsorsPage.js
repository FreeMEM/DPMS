import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { ConfirmDialog, LoadingSpinner } from '../../components/admin/common';
import { sponsorsAPI } from '../../services/api';

const SponsorsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, sponsor: null });

  useEffect(() => {
    fetchSponsors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const response = await sponsorsAPI.list();
      setSponsors(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sponsors:', err);
      setError(t('Error loading sponsors'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await sponsorsAPI.delete(deleteDialog.sponsor.id);
      await fetchSponsors();
      setDeleteDialog({ open: false, sponsor: null });
    } catch (err) {
      console.error('Error deleting sponsor:', err);
      setError(t('Error deleting sponsor'));
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredSponsors = sponsors.filter((sponsor) =>
    sponsor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedSponsors = filteredSponsors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <AdminLayout title={t("Sponsors Management")}>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t("Sponsors Management")}
      breadcrumbs={[{ label: t('Sponsors'), href: '#' }]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          placeholder={t("Search sponsors...")}
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/sponsors/new')}
        >
          {t("New Sponsor")}
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("Logo")}</TableCell>
                <TableCell>{t("Name")}</TableCell>
                <TableCell>{t("Website")}</TableCell>
                <TableCell align="center">{t("Order")}</TableCell>
                <TableCell align="center">{t("Editions")}</TableCell>
                <TableCell align="right">{t("Actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSponsors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      {searchTerm
                        ? t('No sponsors found')
                        : t('No sponsors. Create a new one to get started.')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSponsors.map((sponsor) => (
                  <TableRow key={sponsor.id} hover>
                    <TableCell>
                      {sponsor.logo ? (
                        <Avatar
                          src={sponsor.logo}
                          variant="rounded"
                          sx={{ width: 60, height: 40 }}
                          imgProps={{ style: { objectFit: 'contain' } }}
                        />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 60, height: 40, bgcolor: 'grey.300' }}>
                          -
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {sponsor.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {sponsor.url ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LinkIcon fontSize="small" color="action" />
                          <Typography
                            variant="body2"
                            component="a"
                            href={sponsor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: 'primary.main',
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' },
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                          >
                            {sponsor.url.replace(/^https?:\/\//, '')}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={sponsor.display_order} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={sponsor.editions_names?.length || 0}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/sponsors/${sponsor.id}/edit`)}
                        title={t("Edit")}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog({ open: true, sponsor })}
                        title={t("Delete")}
                        color="error"
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
        <TablePagination
          component="div"
          count={filteredSponsors.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage={t("Rows per page:")}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t("of")} ${count}`}
        />
      </Paper>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, sponsor: null })}
        onConfirm={handleDelete}
        title={t("Delete Sponsor")}
        message={t('Are you sure you want to delete the sponsor "{{name}}"? This action cannot be undone.', { name: deleteDialog.sponsor?.name })}
      />
    </AdminLayout>
  );
};

export default SponsorsPage;
