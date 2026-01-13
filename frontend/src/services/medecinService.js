import api from './api';

const medecinService = {
  // Créer un profil médecin
  create: async (medecinData) => {
    const response = await api.post('/medecins', medecinData);
    return response.data;
  },

  // Lister tous les médecins
  list: async (params) => {
    const response = await api.get('/medecins', { params });
    return response.data;
  },

  // Obtenir un médecin
  getById: async (id) => {
    const response = await api.get(`/medecins/${id}`);
    return response.data;
  },

  // Mettre à jour un médecin
  update: async (id, medecinData) => {
    const response = await api.put(`/medecins/${id}`, medecinData);
    return response.data;
  },

  // Obtenir l'agenda du médecin
  getAgenda: async (id, params) => {
    const response = await api.get(`/medecins/${id}/agenda`, { params });
    return response.data;
  },

  // Vérifier disponibilité
  checkAvailability: async (id, params) => {
    const response = await api.get(`/medecins/${id}/disponibilite`, { params });
    return response.data;
  }
};

export default medecinService;