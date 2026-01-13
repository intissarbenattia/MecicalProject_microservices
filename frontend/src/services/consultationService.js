import api from './api';

const consultationService = {
  // Créer une consultation
  create: async (consultationData) => {
    const response = await api.post('/consultations', consultationData);
    return response.data;
  },

  // Lister les consultations
  list: async (params) => {
    const response = await api.get('/consultations', { params });
    return response.data;
  },

  // Obtenir une consultation
  getById: async (id) => {
    const response = await api.get(`/consultations/${id}`);
    return response.data;
  },

  // Mettre à jour une consultation
  update: async (id, consultationData) => {
    const response = await api.put(`/consultations/${id}`, consultationData);
    return response.data;
  },

  // Supprimer une consultation
  delete: async (id) => {
    const response = await api.delete(`/consultations/${id}`);
    return response.data;
  },

  // Créer une ordonnance - Route corrigée
  createOrdonnance: async (consultationId, ordonnanceData) => {
    const response = await api.post('/consultations/ordonnances', {
      ...ordonnanceData,
      idConsultation: consultationId
    });
    return response.data;
  },

  // Obtenir une ordonnance
  getOrdonnance: async (id) => {
    const response = await api.get(`/consultations/ordonnances/${id}`);
    return response.data;
  },

  // Mettre à jour une ordonnance
  updateOrdonnance: async (id, ordonnanceData) => {
    const response = await api.put(`/consultations/ordonnances/${id}`, ordonnanceData);
    return response.data;
  },

  // Créer un certificat - Route corrigée
  createCertificat: async (consultationId, certificatData) => {
    const response = await api.post('/consultations/certificats', {
      ...certificatData,
      idConsultation: consultationId
    });
    return response.data;
  },

  // Obtenir un certificat
  getCertificat: async (id) => {
    const response = await api.get(`/consultations/certificats/${id}`);
    return response.data;
  },

  // Mettre à jour un certificat
  updateCertificat: async (id, certificatData) => {
    const response = await api.put(`/consultations/certificats/${id}`, certificatData);
    return response.data;
  },

  // Obtenir les consultations par patient
  getByPatient: async (patientId) => {
    const response = await api.get('/consultations', {
      params: { idPatient: patientId }
    });
    return response.data;
  },

  // Obtenir les consultations par médecin
  getByMedecin: async (medecinId) => {
    const response = await api.get('/consultations', {
      params: { idMedecin: medecinId }
    });
    return response.data;
  }
};

export default consultationService;