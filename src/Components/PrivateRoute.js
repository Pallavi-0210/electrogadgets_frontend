// components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

function isTokenValid(token) {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // decode JWT payload
    return payload.exp * 1000 > Date.now(); // check if token is expired
  } catch (err) {
    return false; // malformed token
  }
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  const isValid = isTokenValid(token);

  return isValid ? children : <Navigate to="/Login" replace />;
}

export default PrivateRoute;
