import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import api from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    recent_documents: [],
    recent_returns: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/client/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Welcome to Your Dashboard
        </Typography>
      </Grid>

      {/* Recent Documents */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Documents
          </Typography>
          <List>
            {dashboardData.recent_documents.map((doc) => (
              <ListItem key={doc.id}>
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText
                  primary={doc.filename}
                  secondary={`Uploaded: ${new Date(doc.upload_date).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Recent Tax Returns */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Tax Returns
          </Typography>
          <List>
            {dashboardData.recent_returns.map((taxReturn) => (
              <ListItem key={taxReturn.id}>
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`Tax Year ${taxReturn.tax_year}`}
                  secondary={`Status: ${taxReturn.status}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Quick Stats */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Documents Uploaded
                </Typography>
                <Typography variant="h5">
                  {dashboardData.recent_documents.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Tax Returns
                </Typography>
                <Typography variant="h5">
                  {dashboardData.recent_returns.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Next Deadline
                </Typography>
                <Typography variant="h5">
                  April 15, 2024
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
