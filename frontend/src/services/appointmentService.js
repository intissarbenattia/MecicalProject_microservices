import api from './api';

const appointmentService = {
  // Créer un rendez-vous
  create: async (appointmentData) => {
    const response = await api.post('/rendez-vous', appointmentData);
    return response.data;
  },

  // Lister les rendez-vous
  list: async (params) => {
    const response = await api.get('/rendez-vous', { params });
    return response.data;
  },

  // Obtenir un rendez-vous
  getById: async (id) => {
    const response = await api.get(`/rendez-vous/${id}`);
    return response.data;
  },

  // Annuler un rendez-vous
  cancel: async (id, raison) => {
    const response = await api.put(`/rendez-vous/${id}/annuler`, { raison });
    return response.data;
  },

  // Reprogrammer un rendez-vous
  reschedule: async (id, newData) => {
    const response = await api.put(`/rendez-vous/${id}/reprogrammer`, newData);
    return response.data;
  },

  // Vérifier les conflits
  checkConflicts: async (params) => {
    const response = await api.get('/rendez-vous/verifier-conflits', { params });
    return response.data;
  }
};

export default appointmentService;