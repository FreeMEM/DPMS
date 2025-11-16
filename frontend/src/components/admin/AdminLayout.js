import React from 'react';
import { Box, Container, Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import MainBar from '../../@dpms-freemem/MainBar';
import Content from '../../@dpms-freemem/Content';
import ThreeBackground from '../common/ThreeBackground';
import BackgroundToggle from '../common/BackgroundToggle';

const AdminLayout = ({ children, title, breadcrumbs = [] }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <ThreeBackground variant="admin" />
      <BackgroundToggle />
      <MainBar value={0} />
      <Content>
        <Container maxWidth="xl" sx={{ pt: 10, pb: 4 }}>
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <Breadcrumbs sx={{ mb: 3 }}>
              <MuiLink
                component={Link}
                to="/admin/dashboard"
                underline="hover"
                color="inherit"
              >
                Admin
              </MuiLink>
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return isLast ? (
                  <Typography key={i} color="text.primary">
                    {crumb.label}
                  </Typography>
                ) : (
                  <MuiLink
                    key={i}
                    component={Link}
                    to={crumb.href}
                    underline="hover"
                    color="inherit"
                  >
                    {crumb.label}
                  </MuiLink>
                );
              })}
            </Breadcrumbs>
          )}

          {/* Title */}
          {title && (
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
              {title}
            </Typography>
          )}

          {/* Content */}
          {children}
        </Container>
      </Content>
    </Box>
  );
};

export default AdminLayout;
