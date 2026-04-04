import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { editionsAPI, productionsAPI } from '../../services/api';
import { AuthContext } from '../../AuthContext';
import FileUpload from './FileUpload';
import MainBar from '../../@dpms-freemem/MainBar';

/**
 * Compose the description from structured fields.
 * Only includes sections that have content.
 */
const buildDescription = (fields) => {
  const sections = [];

  if (fields.freeDescription) {
    sections.push(fields.freeDescription);
  }
  if (fields.minMachine) {
    sections.push(`[Minimum machine]\n${fields.minMachine}`);
  }
  if (fields.toolsUsed) {
    sections.push(`[Tools used]\n${fields.toolsUsed}`);
  }
  if (fields.thirdPartyResources) {
    sections.push(`[Third-party resources & licenses]\n${fields.thirdPartyResources}`);
  }
  if (fields.licenseTexts) {
    sections.push(`[License texts for distribution]\n${fields.licenseTexts}`);
  }
  if (fields.additionalInfo) {
    sections.push(`[Additional information]\n${fields.additionalInfo}`);
  }
  if (fields.aiTools) {
    sections.push(`[AI tools used]\n${fields.aiTools}`);
  }

  return sections.join('\n\n');
};

/**
 * Parse a structured description back into individual fields.
 */
const parseDescription = (description) => {
  if (!description) return {};

  const fields = {};
  const tagPattern = /\[(Minimum machine|Tools used|Third-party resources & licenses|License texts for distribution|Additional information|AI tools used)\]\n/g;

  const tags = [];
  let match;
  while ((match = tagPattern.exec(description)) !== null) {
    tags.push({ tag: match[1], index: match.index, end: match.index + match[0].length });
  }

  if (tags.length === 0) {
    fields.freeDescription = description;
    return fields;
  }

  // Text before first tag is freeDescription
  const beforeFirst = description.substring(0, tags[0].index).trim();
  if (beforeFirst) fields.freeDescription = beforeFirst;

  const tagMap = {
    'Minimum machine': 'minMachine',
    'Tools used': 'toolsUsed',
    'Third-party resources & licenses': 'thirdPartyResources',
    'License texts for distribution': 'licenseTexts',
    'Additional information': 'additionalInfo',
    'AI tools used': 'aiTools',
  };

  for (let i = 0; i < tags.length; i++) {
    const contentStart = tags[i].end;
    const contentEnd = i + 1 < tags.length ? tags[i + 1].index : description.length;
    const content = description.substring(contentStart, contentEnd).trim();
    const fieldName = tagMap[tags[i].tag];
    if (fieldName && content) {
      fields[fieldName] = content;
    }
  }

  return fields;
};


const ProductionForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: productionId } = useParams();
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  // Build defaults from user profile
  const defaultAuthor = (() => {
    if (!user?.profile) return '';
    const { nickname, group } = user.profile;
    if (nickname && group) return `${nickname} / ${group}`;
    return nickname || group || '';
  })();
  const defaultGroup = user?.profile?.group || '';
  const defaultEmail = user?.email || '';

  const [formData, setFormData] = useState({
    title: '',
    authors: productionId ? '' : defaultAuthor,
    contactEmail: productionId ? '' : defaultEmail,
    group: productionId ? '' : defaultGroup,
    edition: searchParams.get('edition') ? parseInt(searchParams.get('edition')) : '',
    compo: searchParams.get('compo') ? parseInt(searchParams.get('compo')) : '',
    platform: '',
    // Description sub-fields
    freeDescription: '',
    minMachine: '',
    toolsUsed: '',
    thirdPartyResources: '',
    licenseTexts: '',
    additionalInfo: '',
    aiTools: '',
  });

  const [fileData, setFileData] = useState({ existingFileIds: [], newFiles: [] });
  const [editions, setEditions] = useState([]);
  const [compos, setCompos] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const fetchProduction = useCallback(async () => {
    try {
      const response = await productionsAPI.get(productionId);
      const prod = response.data;
      const descFields = parseDescription(prod.description || '');

      setFormData({
        title: prod.title,
        authors: prod.authors,
        contactEmail: '',
        group: '',
        edition: prod.edition,
        compo: prod.compo,
        platform: prod.platform || '',
        freeDescription: descFields.freeDescription || '',
        minMachine: descFields.minMachine || '',
        toolsUsed: descFields.toolsUsed || '',
        thirdPartyResources: descFields.thirdPartyResources || '',
        licenseTexts: descFields.licenseTexts || '',
        additionalInfo: descFields.additionalInfo || '',
        aiTools: descFields.aiTools || '',
      });
      setExistingFiles(prod.files || []);
      setFileData({ existingFileIds: (prod.files || []).map(f => f.id), newFiles: [] });
    } catch (err) {
      console.error('Error fetching production:', err);
      setError('Error loading production');
    } finally {
      setLoadingData(false);
    }
  }, [productionId]);

  useEffect(() => {
    fetchEditions();
    if (productionId) {
      fetchProduction();
    } else {
      setLoadingData(false);
    }
  }, [productionId, fetchProduction]);

  useEffect(() => {
    if (formData.edition) {
      fetchCompos(formData.edition);
    }
  }, [formData.edition]);

  const fetchEditions = async () => {
    try {
      const response = await editionsAPI.list({ open_to_upload: true });
      setEditions(response.data);
    } catch (err) {
      console.error('Error fetching editions:', err);
      setError('Error loading editions');
    }
  };

  const fetchCompos = async (editionId) => {
    try {
      const response = await editionsAPI.getCompos(editionId);
      const openCompos = response.data.filter(hc => hc.open_to_upload);
      setCompos(openCompos);
    } catch (err) {
      console.error('Error fetching compos:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFilesChanged = (data) => {
    setFileData(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    try {
      // Compose description from structured fields
      const description = buildDescription({
        freeDescription: formData.freeDescription,
        minMachine: formData.minMachine,
        toolsUsed: formData.toolsUsed,
        thirdPartyResources: formData.thirdPartyResources,
        licenseTexts: formData.licenseTexts,
        additionalInfo: formData.additionalInfo,
        aiTools: formData.aiTools,
      });

      // Compose authors with group and contact email
      let authors = formData.authors;
      if (formData.group && !authors.includes(formData.group)) {
        authors = `${authors} / ${formData.group}`;
      }

      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('authors', authors);
      payload.append('description', description);
      payload.append('edition', formData.edition);
      payload.append('compo', formData.compo);
      if (formData.platform) {
        payload.append('platform', formData.platform);
      }

      // Append contact email in description if provided and not already there
      if (formData.contactEmail && !description.includes(formData.contactEmail)) {
        const contactLine = `[Contact email]\n${formData.contactEmail}`;
        payload.set('description', description ? `${description}\n\n${contactLine}` : contactLine);
      }

      for (const file of fileData.newFiles) {
        payload.append('uploaded_files', file);
      }
      for (const id of fileData.existingFileIds) {
        payload.append('files', id);
      }

      if (productionId) {
        await productionsAPI.update(productionId, payload);
      } else {
        await productionsAPI.create(payload);
      }

      navigate('/my-productions');
    } catch (err) {
      console.error('Error submitting production:', err);
      if (err.response?.data) {
        const fieldErrors = err.response.data;
        if (fieldErrors.non_field_errors) {
          setError(fieldErrors.non_field_errors.join('. '));
        } else if (typeof fieldErrors === 'string') {
          setError(fieldErrors);
        } else {
          setErrors(fieldErrors);
          const firstError = Object.values(fieldErrors)[0];
          setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
        }
      } else {
        setError('Error submitting production. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const PLATFORM_CHOICES = [
    ['amiga_ocs', 'Amiga OCS'],
    ['amiga_aga', 'Amiga AGA'],
    ['pc', 'PC'],
    ['c64', 'Commodore 64'],
    ['atari_st', 'Atari ST'],
    ['zx_spectrum', 'ZX Spectrum'],
    ['msx', 'MSX'],
    ['amstrad_cpc', 'Amstrad CPC'],
    ['snes', 'SNES'],
    ['megadrive', 'Mega Drive'],
    ['gameboy', 'Game Boy'],
    ['arduino', 'Arduino'],
    ['web', 'Web/Browser'],
    ['multiplatform', 'Multiplataforma'],
    ['other', 'Otra'],
  ];

  const pageContent = loadingData ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  ) : (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {productionId ? t('Edit Production') : t('Submit Production')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Edition & Competition */}
          <FormControl fullWidth margin="normal" error={!!errors.edition}>
            <InputLabel>{t("Edition")}</InputLabel>
            <Select
              name="edition"
              value={editions.length > 0 ? formData.edition : ''}
              onChange={handleChange}
              label={t("Edition")}
              required
              disabled={!!productionId}
            >
              {editions.map((edition) => (
                <MenuItem key={edition.id} value={edition.id}>
                  {edition.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            error={!!errors.compo}
            disabled={!formData.edition || !!productionId}
          >
            <InputLabel>{t("Competition")}</InputLabel>
            <Select
              name="compo"
              value={compos.length > 0 ? formData.compo : ''}
              onChange={handleChange}
              label={t("Competition")}
              required
            >
              {compos.map((hasCompo) => (
                <MenuItem key={hasCompo.compo} value={hasCompo.compo}>
                  {hasCompo.compo_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          {/* Basic info */}
          <TextField
            fullWidth
            margin="normal"
            name="title"
            label={t("Title")}
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title?.[0]}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            name="authors"
            label={t("Full name of the author(s)")}
            value={formData.authors}
            onChange={handleChange}
            error={!!errors.authors}
            helperText={errors.authors?.[0]}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            name="group"
            label={t("Group(s)")}
            value={formData.group}
            onChange={handleChange}
            helperText={t("Group(s) the authors belong to (if applicable)")}
          />

          <TextField
            fullWidth
            margin="normal"
            name="contactEmail"
            label={t("Contact email")}
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>{t("Platform")}</InputLabel>
            <Select
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              label={t("Platform")}
            >
              <MenuItem value=""><em>{t("Not specified")}</em></MenuItem>
              {PLATFORM_CHOICES.map(([value, label]) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            name="minMachine"
            label={t("Minimum machine required")}
            value={formData.minMachine}
            onChange={handleChange}
            helperText={t("Minimum hardware/software required to run the production")}
          />

          <Divider sx={{ my: 2 }} />

          {/* Description */}
          <TextField
            fullWidth
            margin="normal"
            name="freeDescription"
            label={t("Description")}
            value={formData.freeDescription}
            onChange={handleChange}
            multiline
            rows={3}
          />

          {/* Technical details - collapsible */}
          <Accordion
            sx={{
              mt: 2,
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: 1,
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
              sx={{ bgcolor: 'rgba(255, 165, 0, 0.08)' }}
            >
              <Typography fontWeight={600} color="primary">{t("Technical details & Licensing")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                fullWidth
                margin="normal"
                name="toolsUsed"
                label={t("Tools used for development")}
                value={formData.toolsUsed}
                onChange={handleChange}
                multiline
                rows={2}
                helperText={t("List all tools used (compilers, editors, frameworks, etc.)")}
              />

              <TextField
                fullWidth
                margin="normal"
                name="thirdPartyResources"
                label={t("Third-party resources")}
                value={formData.thirdPartyResources}
                onChange={handleChange}
                multiline
                rows={2}
                helperText={t("List third-party resources included with links to their licenses")}
              />

              <TextField
                fullWidth
                margin="normal"
                name="licenseTexts"
                label={t("License texts for distribution")}
                value={formData.licenseTexts}
                onChange={handleChange}
                multiline
                rows={2}
                helperText={t("License texts that need to be included in the distribution")}
              />

              <TextField
                fullWidth
                margin="normal"
                name="aiTools"
                label={t("AI tools used")}
                value={formData.aiTools}
                onChange={handleChange}
                multiline
                rows={2}
                helperText={t("If AI tools were used (even partially), specify which tools and in which parts")}
              />

              <TextField
                fullWidth
                margin="normal"
                name="additionalInfo"
                label={t("Additional information")}
                value={formData.additionalInfo}
                onChange={handleChange}
                multiline
                rows={2}
                helperText={t("Development process, custom tools, or any other relevant info")}
              />
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ my: 2 }} />

          {/* File upload */}
          <Box sx={{ mt: 2 }}>
            <FileUpload
              onFilesChanged={handleFilesChanged}
              initialFiles={existingFiles}
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? t('Submitting...') : productionId ? t('Update') : t('Submit')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/my-productions')}
              disabled={loading}
            >
              {t('Cancel')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <MainBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: { sm: '64px' } }}>
        {pageContent}
      </Box>
    </Box>
  );
};

export default ProductionForm;
