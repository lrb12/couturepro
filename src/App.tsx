import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardPage } from './pages/Dashboard';
import { ClientsPage } from './pages/Clients';
import { CommandesPage } from './pages/Commandes';
import { AlertsPage } from './pages/Alerts';
import { ProfilePage } from './pages/Profile';
import { LoginPage } from './pages/Login';
import { AdminPage } from './pages/AdminPage';
import { NouveauPaiementPage } from './pages/paiements/NouveauPaiementPage';
import { ActionsRapidesPage } from './pages/ActionsRapidesPage';
import { isAuthenticated, cleanupOldDemoCodes, ensureAdminCode } from './services/auth';
import { initializeDatabase } from './services/database';

// Route protégée
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setIsAuth(authenticated);
    };
    checkAuth();
  }, []);

  if (isAuth === null) return <div>Vérification...</div>;
  return isAuth ? <>{children}</> : <Navigate to="/login" />;
};

// Layout
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {children}
      <BottomNav />
    </div>
  );
};

function App() {
  useEffect(() => {
    // Initialisation DB
    initializeDatabase();

    // Supprimer anciens codes demo
    cleanupOldDemoCodes();

    // S'assurer que le code admin existe
    ensureAdminCode();

    // Service Worker PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('SW registered: ', reg))
          .catch(err => console.log('SW registration failed: ', err));
      });
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route 
          path="/admin-secret"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/clients" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <ClientsPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/commandes" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <CommandesPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/alertes" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <AlertsPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profil" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;