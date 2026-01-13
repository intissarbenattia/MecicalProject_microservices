import api from './api';

const secretaireService = {
  // Créer un profil secrétaire
  create: async (secretaireData) => {
    const response = await api.post('/secretaires', secretaireData);
    return response.data;
  },

  // Obtenir le profil secrétaire
  getProfile: async () => {
    const response = await api.get('/secretaires');
    return response.data;
  },

  // Mettre à jour le profil
  update: async (secretaireData) => {
    const response = await api.put('/secretaires', secretaireData);
    return response.data;
  }
};

export default secretaireService;