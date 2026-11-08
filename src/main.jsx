import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ROUTER_MODE } from './lib/env';
import './index.css';

const Router = ROUTER_MODE === 'memory' ? MemoryRouter : BrowserRouter;
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined; // '/finix-center-web' en GitHub Pages

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router basename={ROUTER_MODE === 'memory' ? undefined : basename}>
      <ThemeProvider><ToastProvider><AuthProvider><App /></AuthProvider></ToastProvider></ThemeProvider>
    </Router>
  </React.StrictMode>
);
