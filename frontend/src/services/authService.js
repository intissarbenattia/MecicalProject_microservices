import api from './api';
import {jwtDecode} from 'jwt-decode';

const authService = {
  // Inscription
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.utilisateur));
    }
    return response.data;
  },

  // Connexion
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.utilisateur));
    }
    return response.data;
  },

  // Connexion Google
  loginWithGoogle: (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    localStorage.setItem('user', JSON.stringify(decoded));
    return decoded;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Obtenir le token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      // Vérifier si le token n'est pas expiré
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      return error;
    }
  },

  // Obtenir le profil
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (userData) => {
    const response = await api.put('/auth/utilisateur', userData);
    if (response.data.utilisateur) {
      localStorage.setItem('user', JSON.stringify(response.data.utilisateur));
    }
    return response.data;
  },

};

export default authService;