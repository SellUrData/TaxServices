import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RequireRole = ({ roles, children }) => {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(userRole)) {
    // Role not authorized, redirect to home page
    return <Navigate to="/" replace />;
  }

  // Authorized, render children
  return children;
};

export default RequireRole;
