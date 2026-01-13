import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GoogleCallback from './components/auth/GoogleCallback';
import PatientDashboardPage from './pages/PatientDashboardPage';
import SecretaireDashboardPage from './pages/SecretaireDashboardPage';
import MedecinDashboardPage from './pages/MedecinDashboardPage';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />

          {/* Routes protégées - À venir */}
          <Route
            path="/patient/*"
            element={
              <PrivateRoute allowedRoles={['PATIENT']}>
                <PatientDashboardPage/>
              </PrivateRoute>
            }
          />

          <Route
            path="/secretaire/*"
            element={
              <PrivateRoute allowedRoles={['SECRETAIRE']}>
                <SecretaireDashboardPage/>
              </PrivateRoute>
            }
          />

          <Route
            path="/medecin/*"
            element={
              <PrivateRoute allowedRoles={['MEDECIN']}>
                <MedecinDashboardPage/>
              </PrivateRoute>
            }
          />

          {/* Page non trouvée */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;