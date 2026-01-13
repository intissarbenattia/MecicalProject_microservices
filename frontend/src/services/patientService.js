import api from './api';

const patientService = {
  // Créer un profil patient
  createProfile: async (profileData) => {
    const response = await api.post('/patients', profileData);
    return response.data;
  },

  // Obtenir le profil patient
  getProfile: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (id, profileData) => {
    const response = await api.put(`/patients/${id}`, profileData);
    return response.data;
  },

  // Lister tous les patients
  listPatients: async (params) => {
    const response = await api.get('/patients', { params });
    return response.data;
  },

  // Obtenir les prochains rendez-vous
  getUpcomingAppointments: async (id) => {
    const response = await api.get(`/patients/${id}/rendez-vous`);
    return response.data;
  },

  // Ajouter un fichier
  uploadFile: async (id, fileData) => {
    const response = await api.post(`/patients/${id}/fichiers`, fileData);
    return response.data;
  },

  // Supprimer un fichier
  deleteFile: async (id, fileId) => {
    const response = await api.delete(`/patients/${id}/fichiers/${fileId}`);
    return response.data;
  },

  // Supprimer un patient
  deletePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  }

};

export default patientService;