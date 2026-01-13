import api from './api';

const paymentService = {
  // Créer un paiement
  create: async (paymentData) => {
    const response = await api.post('/paiements', paymentData);
    return response.data;
  },

  // Lister les paiements
  list: async (params) => {
    const response = await api.get('/paiements', { params });
    return response.data;
  },

  // Obtenir un paiement
  getById: async (id) => {
    const response = await api.get(`/paiements/${id}`);
    return response.data;
  },

  // Mettre à jour un paiement
  update: async (id, paymentData) => {
    const response = await api.put(`/paiements/${id}`, paymentData);
    return response.data;
  },

  // Statistiques
  getStatistics: async (params) => {
    const response = await api.get('/paiements/statistiques', { params });
    return response.data;
  }
};

export default paymentService;