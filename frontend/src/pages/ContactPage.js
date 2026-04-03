import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Email as EmailIcon,
  FlightTakeoff as TravelIcon,
  Send as SendIcon,
  ContactMail as ContactIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { editionsAPI } from '../services/api';
import MainBar from '../@dpms-freemem/MainBar';
import ThreeBackground from '../components/common/ThreeBackground';
import BackgroundToggle from '../components/common/BackgroundToggle';

// Simple markdown renderer (##, **, -, links)
const SimpleMarkdown = ({ children }) => {
  if (!children) return null;
  const lines = children.split('\n');
  const elements = [];
  let listItems = [];

  const renderInline = (text) => {
    // Bold + links
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #FFA500;">$1</a>');
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <Box component="ul" key={`ul-${elements.length}`} sx={{ pl: 2, my: 0.5 }}>
          {listItems.map((item, i) => (
            <Typography component="li" key={i} variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: renderInline(item) }}
            />
          ))}
        </Box>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) { flushList(); return; }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <Typography key={i} variant="h6" fontWeight={600} sx={{ mt: elements.length > 0 ? 3 : 0, mb: 1 }}>
          {trimmed.replace('## ', '')}
        </Typography>
      );
    } else if (trimmed.startsWith('- ')) {
      listItems.push(trimmed.replace('- ', ''));
    } else {
      flushList();
      elements.push(
        <Typography key={i} variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 0.5 }}
          dangerouslySetInnerHTML={{ __html: renderInline(trimmed) }}
        />
      );
    }
  });
  flushList();
  return <Box>{elements}</Box>;
};

const ContactPage = () => {
  const { t } = useTranslation();
  const [edition, setEdition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    editionsAPI.list({ public: true })
      .then(res => {
        const list = res.data || [];
        if (list.length > 0) {
          // Use the most recent edition (first in list, sorted by -created)
          const open = list.find(e => e.open_to_upload);
          setEdition(open || list[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = t('Required');
    if (!form.email.trim()) errs.email = t('Required');
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = t('Invalid email');
    if (!form.subject.trim()) errs.subject = t('Required');
    if (!form.message.trim()) errs.message = t('Required');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !edition) return;

    try {
      setSending(true);
      await editionsAPI.sendContact({
        edition: edition.id,
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSnackbar({ open: true, message: t('Message sent successfully!'), severity: 'success' });
      setForm({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    } catch (err) {
      const msg = err.response?.data?.error || t('Failed to send message. Please try again later.');
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex' }}>
        <MainBar />
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <ThreeBackground variant="user" />
      <BackgroundToggle />
      <MainBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: { sm: '64px' }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 1, sm: 3 } }}>

          <Typography variant="h4" gutterBottom fontWeight={700}>
            {t("Contact")}
          </Typography>
          {edition && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {edition.title}
            </Typography>
          )}

          {/* Contact Info */}
          {edition?.contact_info && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <ContactIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>{t("Contact Information")}</Typography>
              </Box>
              <SimpleMarkdown>{edition.contact_info}</SimpleMarkdown>
            </Paper>
          )}

          {/* Travel Info */}
          {edition?.travel_info && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <TravelIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>{t("How to Get There")}</Typography>
              </Box>
              <SimpleMarkdown>{edition.travel_info}</SimpleMarkdown>
            </Paper>
          )}

          {/* Contact Form */}
          {edition?.contact_form_enabled && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <EmailIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>{t("Send us a Message")}</Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    label={t("Name")}
                    value={form.name}
                    onChange={handleChange('name')}
                    error={!!errors.name}
                    helperText={errors.name}
                    fullWidth
                    required
                  />
                  <TextField
                    label={t("Email")}
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                    fullWidth
                    required
                  />
                </Box>
                <TextField
                  label={t("Subject")}
                  value={form.subject}
                  onChange={handleChange('subject')}
                  error={!!errors.subject}
                  helperText={errors.subject}
                  fullWidth
                  required
                />
                <TextField
                  label={t("Message")}
                  value={form.message}
                  onChange={handleChange('message')}
                  error={!!errors.message}
                  helperText={errors.message}
                  fullWidth
                  required
                  multiline
                  rows={5}
                />
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                  disabled={sending}
                  sx={{ alignSelf: 'flex-end', px: 4 }}
                >
                  {sending ? t("Sending...") : t("Send Message")}
                </Button>
              </Box>
            </Paper>
          )}

          {/* No info at all */}
          {!edition?.contact_info && !edition?.travel_info && !edition?.contact_form_enabled && (
            <Alert severity="info">
              {t("Contact information is not available yet for this edition.")}
            </Alert>
          )}

        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactPage;
