// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  const isAuthenticated = 
    localStorage.getItem('isAuthenticated') === 'true' && 
    localStorage.getItem('auth_token');
  
  if (!isAuthenticated) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }
  
  return children;
};

export default ProtectedRoute;