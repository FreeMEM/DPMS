import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { editionsAPI, productionsAPI } from '../../services/api';
import FileUpload from './FileUpload';
import MainBar from '../../@dpms-freemem/MainBar';


const ProductionForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: productionId } = useParams();

  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    description: '',
    edition: searchParams.get('edition') || '',
    compo: searchParams.get('compo') || '',
    files: [],
  });

  const [editions, setEditions] = useState([]);
  const [compos, setCompos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const fetchProduction = useCallback(async () => {
    try {
      const response = await productionsAPI.get(productionId);
      const prod = response.data;
      setFormData({
        title: prod.title,
        authors: prod.authors,
        description: prod.description || '',
        edition: prod.edition,
        compo: prod.compo,
        files: prod.files || [],
      });
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
      // Filter only open compos
      const openCompos = response.data.filter(hc => hc.open_to_upload);
      setCompos(openCompos);
    } catch (err) {
      console.error('Error fetching compos:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFilesUploaded = (fileIds) => {
    setFormData(prev => ({
      ...prev,
      files: fileIds,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    try {
      const submitData = {
        ...formData,
        edition: parseInt(formData.edition),
        compo: parseInt(formData.compo),
      };

      if (productionId) {
        await productionsAPI.update(productionId, submitData);
      } else {
        await productionsAPI.create(submitData);
      }

      navigate('/my-productions');
    } catch (err) {
      console.error('Error submitting production:', err);

      if (err.response?.data) {
        // Handle field errors
        const fieldErrors = err.response.data;

        if (fieldErrors.non_field_errors) {
          setError(fieldErrors.non_field_errors.join('. '));
        } else {
          setErrors(fieldErrors);

          // Set general error from first field error
          const firstError = Object.values(fieldErrors)[0];
          if (Array.isArray(firstError)) {
            setError(firstError[0]);
          } else {
            setError(firstError);
          }
        }
      } else {
        setError('Error submitting production. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const pageContent = loadingData ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  ) : (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {productionId ? 'Edit Production' : 'Submit Production'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" error={!!errors.edition}>
            <InputLabel>Edition</InputLabel>
            <Select
              name="edition"
              value={formData.edition}
              onChange={handleChange}
              label="Edition"
              required
              disabled={!!productionId}
            >
              {editions.map((edition) => (
                <MenuItem key={edition.id} value={edition.id}>
                  {edition.title}
                </MenuItem>
              ))}
            </Select>
            {errors.edition && (
              <Typography variant="caption" color="error">
                {errors.edition[0]}
              </Typography>
            )}
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            error={!!errors.compo}
            disabled={!formData.edition || !!productionId}
          >
            <InputLabel>Competition</InputLabel>
            <Select
              name="compo"
              value={formData.compo}
              onChange={handleChange}
              label="Competition"
              required
            >
              {compos.map((hasCompo) => (
                <MenuItem key={hasCompo.compo_id} value={hasCompo.compo_id}>
                  {hasCompo.compo_name}
                </MenuItem>
              ))}
            </Select>
            {errors.compo && (
              <Typography variant="caption" color="error">
                {errors.compo[0]}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            name="title"
            label="Title"
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
            label="Authors / Group"
            value={formData.authors}
            onChange={handleChange}
            error={!!errors.authors}
            helperText={errors.authors?.[0]}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description?.[0]}
            multiline
            rows={4}
          />

          <Box sx={{ mt: 3 }}>
            <FileUpload
              onFilesUploaded={handleFilesUploaded}
              initialFiles={formData.files}
            />
            {errors.files && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.files[0]}
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : productionId ? 'Update' : 'Submit'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/my-productions')}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <MainBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: { lg: '64px' } }}>
        {pageContent}
      </Box>
    </Box>
  );
};

export default ProductionForm;
