// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if JWT exists in local storage
  const isAuthenticated = !!localStorage.getItem('token');

  // If authenticated, render the children (Outlet), otherwise redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
