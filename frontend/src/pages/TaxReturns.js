import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Box
} from '@mui/material';
import axios from 'axios';

const TaxReturns = () => {
  const [taxReturns, setTaxReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxReturns();
  }, []);

  const fetchTaxReturns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/client/tax-returns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaxReturns(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tax returns:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      not_started: 'default',
      in_progress: 'primary',
      review: 'warning',
      completed: 'success'
    };
    return statusColors[status] || 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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
          Tax Returns
        </Typography>
      </Grid>

      {/* Summary Cards */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Returns
                </Typography>
                <Typography variant="h5">
                  {taxReturns.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed Returns
                </Typography>
                <Typography variant="h5">
                  {taxReturns.filter(ret => ret.status === 'completed').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  In Progress
                </Typography>
                <Typography variant="h5">
                  {taxReturns.filter(ret => ret.status === 'in_progress').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Tax Returns Table */}
      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tax Year</TableCell>
                <TableCell>Filing Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total Income</TableCell>
                <TableCell>Total Deductions</TableCell>
                <TableCell>Total Tax</TableCell>
                <TableCell>Created Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {taxReturns.map((taxReturn) => (
                <TableRow key={taxReturn.id}>
                  <TableCell>{taxReturn.tax_year}</TableCell>
                  <TableCell>{taxReturn.filing_type}</TableCell>
                  <TableCell>
                    <Chip
                      label={taxReturn.status.replace('_', ' ')}
                      color={getStatusColor(taxReturn.status)}
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(taxReturn.total_income)}</TableCell>
                  <TableCell>{formatCurrency(taxReturn.total_deductions)}</TableCell>
                  <TableCell>{formatCurrency(taxReturn.total_tax)}</TableCell>
                  <TableCell>
                    {new Date(taxReturn.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* Empty State */}
      {taxReturns.length === 0 && (
        <Grid item xs={12}>
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary">
              No tax returns found
            </Typography>
            <Typography color="textSecondary">
              Your tax returns will appear here once they are created
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default TaxReturns;
