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
import { isAuthenticated } from './services/auth';
import { initializeDatabase } from './services/database';
import { cleanupOldDemoCodes } from './services/auth';

// Composant pour les routes protégées
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setIsAuth(authenticated);
    };
    checkAuth();
  }, []);
  const App: React.FC = () => {
  useEffect(() => {
    console.log('App mounted');
  }, []);

  return <div>Bonjour</div>;
};


  if (isAuth === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification...</p>
        </div>
      </div>
    );
  }

  return isAuth ? <>{children}</> : <Navigate to="/login" />;
};
useEffect(() => {
  // -> supprime définitivement les anciens codes de test de toutes les bases clients
  cleanupOldDemoCodes();
}, []);

// Layout principal avec navigation
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
    // Initialiser la base de données
    initializeDatabase();

    // Enregistrer le service worker pour la PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => console.log('SW registered: ', registration))
          .catch((registrationError) => console.log('SW registration failed: ', registrationError));
      });
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Route de connexion */}
        <Route path="/login" element={<LoginPage />} />

        {/* Route admin secrète */}
        <Route 
          path="/admin-secret" 
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } 
        />

        {/* Dashboard */}
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

        {/* Pages existantes */}
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

        {/* Routes CTA */}
        <Route 
          path="/clients/nouveau"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ClientsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/commandes/nouvelle"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CommandesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/paiements/nouveau"
          element={
            <ProtectedRoute>
              <MainLayout>
                <NouveauPaiementPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/actions"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ActionsRapidesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
