import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import axiosWrapper from "../../utils/AxiosWrapper";

const EditionLogo = ({ height = 100 }) => {
  const [edition, setEdition] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchEdition = async () => {
      try {
        const response = await axiosWrapper().get('/api/editions/?public=true');
        if (response.data && response.data.length > 0) {
          setEdition(response.data[0]);
        }
      } catch (err) {
        // fallback: no logo
      } finally {
        setLoaded(true);
      }
    };
    fetchEdition();
  }, []);

  if (!loaded) return <Box sx={{ minHeight: height }} />;

  if (edition?.logo) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mb={2} sx={{ minHeight: height }}>
        <img
          src={edition.logo}
          alt={edition.title || "Logo"}
          style={{
            maxHeight: height,
            maxWidth: '100%',
            objectFit: 'contain',
            filter: edition.logo_border_width > 0
              ? `drop-shadow(0 0 ${edition.logo_border_width}px ${edition.logo_border_color || '#00ff00'})`
              : 'none',
          }}
        />
      </Box>
    );
  }

  if (edition?.title) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mb={2} sx={{ minHeight: height }}>
        <Typography variant="h4" align="center" color="primary" fontWeight={700}>
          {edition.title}
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" mb={2} sx={{ minHeight: height }}>
      <Typography variant="h4" align="center" color="primary" fontWeight={700}>
        DPMS
      </Typography>
    </Box>
  );
};

export default EditionLogo;
