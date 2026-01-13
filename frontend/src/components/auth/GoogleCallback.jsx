import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      try {
        const user = loginWithGoogle(token);
        
        // Redirection selon le rôle
        switch (user.role) {
          case 'PATIENT':
            navigate('/patient/dashboard');
            break;
          case 'SECRETAIRE':
            navigate('/secretaire/dashboard');
            break;
          case 'MEDECIN':
            navigate('/medecin/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      } catch (error) {
        console.error('Erreur Google OAuth:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, loginWithGoogle, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader text="Connexion avec Google..." />
    </div>
  );
};

export default GoogleCallback;