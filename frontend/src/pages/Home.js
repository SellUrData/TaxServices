import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SpeedIcon from '@mui/icons-material/Speed';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure & Confidential',
      description: 'Your financial data is protected with bank-level security and encryption.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Fast Processing',
      description: 'Get your taxes done quickly with our efficient online system.'
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
      title: 'Expert Support',
      description: 'Access to professional tax experts whenever you need assistance.'
    },
    {
      icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
      title: 'Maximum Returns',
      description: 'We ensure you get every deduction and credit you deserve.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Smythe Tax Services
              </Typography>
              <Typography variant="h5" paragraph>
                Professional tax preparation services with a personal touch
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ mr: 2 }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ mb: 6 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose Us
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 2, color: 'primary.main' }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={6} textAlign="center">
              <Typography variant="h4" component="h2" gutterBottom>
                Ready to get started?
              </Typography>
              <Typography variant="body1" paragraph>
                Join thousands of satisfied clients who trust us with their taxes
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/register')}
              >
                Create Your Account
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
