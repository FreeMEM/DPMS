import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { editionsAPI } from '../../services/api';
import MainBar from '../../@dpms-freemem/MainBar';
import Content from '../../@dpms-freemem/Content';

const ComposList = () => {
  const navigate = useNavigate();
  const [editions, setEditions] = useState([]);
  const [selectedEdition, setSelectedEdition] = useState(null);
  const [compos, setCompos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEditions();
  }, []);

  useEffect(() => {
    if (selectedEdition) {
      fetchCompos(selectedEdition);
    }
  }, [selectedEdition]);

  const fetchEditions = async () => {
    try {
      const response = await editionsAPI.list({ open_to_upload: true });
      const editionsList = response.data;

      if (editionsList.length > 0) {
        setEditions(editionsList);
        setSelectedEdition(editionsList[0].id);
      } else {
        setError('No editions currently open for submissions');
      }
    } catch (err) {
      console.error('Error fetching editions:', err);
      setError('Error loading editions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompos = async (editionId) => {
    try {
      setLoading(true);
      const response = await editionsAPI.getCompos(editionId);
      setCompos(response.data);
    } catch (err) {
      console.error('Error fetching compos:', err);
      setError('Error loading competitions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProduction = (compoId) => {
    navigate(`/productions/new?edition=${selectedEdition}&compo=${compoId}`);
  };

  const pageContent = loading && !selectedEdition ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  ) : (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Competitions
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {editions.length > 0 && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Edition</InputLabel>
          <Select
            value={selectedEdition || ''}
            onChange={(e) => setSelectedEdition(e.target.value)}
            label="Edition"
          >
            {editions.map((edition) => (
              <MenuItem key={edition.id} value={edition.id}>
                {edition.title}
                {edition.open_to_upload && (
                  <Chip label="Open" size="small" color="success" sx={{ ml: 1 }} />
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {loading && selectedEdition ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {compos.map((hasCompo) => (
            <Grid item xs={12} sm={6} md={4} key={hasCompo.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrophyIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {hasCompo.compo_name}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {hasCompo.compo_description || 'No description available'}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    {hasCompo.open_to_upload ? (
                      <Chip label="Open for submissions" color="success" size="small" />
                    ) : (
                      <Chip label="Closed" color="error" size="small" />
                    )}
                  </Box>

                  {hasCompo.start && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Starts: {new Date(hasCompo.start).toLocaleString()}
                    </Typography>
                  )}
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={!hasCompo.open_to_upload}
                    onClick={() => handleSubmitProduction(hasCompo.compo_id)}
                  >
                    Submit Production
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {compos.length === 0 && !loading && !error && (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          No competitions available for this edition yet.
        </Typography>
      )}
    </Box>
  );

  return (
    <Box>
      <MainBar />
      <Content>
        {pageContent}
      </Content>
    </Box>
  );
};

export default ComposList;
