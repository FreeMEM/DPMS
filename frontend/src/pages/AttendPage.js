import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI, editionsAPI } from '../services/api';
import MainBar from '../@dpms-freemem/MainBar';

const isoDate = (d) => d.toISOString().slice(0, 10);

const buildDayRange = (edition) => {
  if (!edition?.start_date) return [];
  const start = new Date(edition.start_date);
  const end = edition.end_date ? new Date(edition.end_date) : start;
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const days = [];
  for (
    let d = new Date(startDay);
    d.getTime() <= endDay.getTime();
    d.setDate(d.getDate() + 1)
  ) {
    days.push(isoDate(d));
  }
  return days;
};

const AttendPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [edition, setEdition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [attendance, setAttendance] = useState(null);
  const [equipment, setEquipment] = useState('');
  const [sleepsAt, setSleepsAt] = useState('venue');
  const [days, setDays] = useState([]);

  const availableDays = useMemo(() => buildDayRange(edition), [edition]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const editionsRes = await editionsAPI.list({ public: true });
        const editions = Array.isArray(editionsRes.data) ? editionsRes.data : [];
        const current = editions[0] || null;
        if (!current) {
          setError(t('No upcoming edition is open for attendance right now.'));
          return;
        }
        setEdition(current);

        try {
          const res = await attendanceAPI.mine(current.id);
          if (res.status === 200 && res.data) {
            setAttendance(res.data);
            setEquipment(res.data.equipment || '');
            setSleepsAt(res.data.sleeps_at || 'venue');
            setDays(res.data.days || []);
          }
        } catch (e) {
          // 204 (no content) arrives as a regular response, but some axios
          // setups surface it here; treat as "no prior attendance".
          if (e.response && e.response.status !== 204) {
            throw e;
          }
        }
      } catch (e) {
        console.error('Failed to load attendance state', e);
        setError(t('We could not load your attendance. Please try again.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  const toggleDay = useCallback((day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!edition) return;
    try {
      setSaving(true);
      const res = await attendanceAPI.save({
        edition: edition.id,
        equipment,
        sleeps_at: sleepsAt,
        days,
      });
      setAttendance(res.data);
      setSnackbar({
        open: true,
        message: t('Attendance confirmed. Thanks for coming!'),
        severity: 'success',
      });
    } catch (e) {
      console.error('Failed to save attendance', e);
      const message =
        (e.response && e.response.data && (e.response.data.days || e.response.data.detail)) ||
        t('Could not save your attendance. Please try again.');
      setSnackbar({
        open: true,
        message: Array.isArray(message) ? message.join(' ') : String(message),
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async () => {
    if (!attendance) return;
    const confirmed = window.confirm(
      t('This will cancel your attendance confirmation. Continue?')
    );
    if (!confirmed) return;
    try {
      setSaving(true);
      await attendanceAPI.remove(attendance.id);
      setAttendance(null);
      setEquipment('');
      setSleepsAt('venue');
      setDays([]);
      setSnackbar({
        open: true,
        message: t('Your attendance has been withdrawn.'),
        severity: 'info',
      });
    } catch (e) {
      console.error('Failed to withdraw attendance', e);
      setSnackbar({
        open: true,
        message: t('Could not withdraw your attendance. Please try again.'),
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderDay = (day) => {
    const locale = i18n.language || 'es';
    const label = new Date(`${day}T00:00:00`).toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    return (
      <FormControlLabel
        key={day}
        control={
          <Checkbox
            checked={days.includes(day)}
            onChange={() => toggleDay(day)}
            disabled={saving}
          />
        }
        label={label}
      />
    );
  };

  if (loading) {
    return (
      <>
        <MainBar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MainBar />
        <Box maxWidth={640} mx="auto" mt={4} px={2}>
          <Alert severity="warning">{error}</Alert>
          <Box mt={2}>
            <Button onClick={() => navigate('/')}>{t('Back to dashboard')}</Button>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <MainBar />
      <Box maxWidth={640} mx="auto" mt={4} px={2} pb={6}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h4" gutterBottom>
            {attendance ? t('Your attendance') : t("I'm going")}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {edition.title}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} mt={3}>
            <Stack spacing={3}>
              <TextField
                label={t('Equipment you bring')}
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                multiline
                minRows={3}
                placeholder={t(
                  'e.g. Amiga 500, external monitor, mixer, a few extension cords…'
                )}
                fullWidth
                disabled={saving}
              />

              <FormControl disabled={saving}>
                <FormLabel>{t('Where will you sleep?')}</FormLabel>
                <RadioGroup
                  row
                  value={sleepsAt}
                  onChange={(e) => setSleepsAt(e.target.value)}
                >
                  <FormControlLabel
                    value="venue"
                    control={<Radio />}
                    label={t('At the party')}
                  />
                  <FormControlLabel
                    value="external"
                    control={<Radio />}
                    label={t('Outside')}
                  />
                </RadioGroup>
              </FormControl>

              <FormControl disabled={saving || availableDays.length === 0}>
                <FormLabel>{t('Days you will attend')}</FormLabel>
                {availableDays.length > 0 ? (
                  <Box display="flex" flexWrap="wrap" columnGap={2} rowGap={0.5} mt={1}>
                    {availableDays.map(renderDay)}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {t('Dates not yet available for this edition.')}
                  </Typography>
                )}
              </FormControl>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                {attendance && (
                  <Button
                    type="button"
                    color="error"
                    variant="outlined"
                    disabled={saving}
                    onClick={handleWithdraw}
                  >
                    {t('Withdraw')}
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                >
                  {attendance ? t('Update attendance') : t('Confirm attendance')}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AttendPage;
