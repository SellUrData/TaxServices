import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  console.log('PrivateRoute:', currentUser ? 'User authenticated' : 'No user');
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default PrivateRoute;
