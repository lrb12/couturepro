import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, cleanupOldDemoCodes } from './services/auth';
import { initializeDatabase } from './services/database';
import { CommandesPage } from './pages/Commandes';
import { ClientsPage } from './pages/Clients';
import { DashboardPage } from './pages/Dashboard';
import { AdminSecretPage } from './pages/AdminSecret';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await isAuthenticated();
      setAuth(isAuth);
    };
    checkAuth();
  }, []);

  if (auth === null) return <div>Chargement...</div>;
  return auth ? children : <Navigate to="/login" />;
};

const App: React.FC = () => {
  useEffect(() => {
    // Initialisation DB et suppression des anciens codes DEMO
    const initApp = async () => {
      await initializeDatabase();
      await cleanupOldDemoCodes(); // supprime les anciens DEMO2024
    };
    initApp();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
        <Route path="/commandes" element={<ProtectedRoute><CommandesPage /></ProtectedRoute>} />
        <Route path="/admin-secret" element={<ProtectedRoute><AdminSecretPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
