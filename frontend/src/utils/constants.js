// utils/constants.js - Constantes globales de l'application

export const ROLES = {
  PATIENT: 'PATIENT',
  MEDECIN: 'MEDECIN',
  SECRETAIRE: 'SECRETAIRE'
};

export const APPOINTMENT_STATUS = {
  PREVU: 'PREVU',
  REALISE: 'REALISE',
  ANNULE: 'ANNULE'
};

export const PAYMENT_STATUS = {
  PAYE: 'PAYE',
  PARTIEL: 'PARTIEL',
  IMPAYE: 'IMPAYE'
};

export const PAYMENT_METHODS = {
  ESPECES: 'ESPECES',
  CARTE: 'CARTE',
  CHEQUE: 'CHEQUE',
  VIREMENT: 'VIREMENT'
};

export const PAYMENT_METHOD_LABELS = {
  ESPECES: { label: 'Espèces', icon: '💵' },
  CARTE: { label: 'Carte', icon: '💳' },
  CHEQUE: { label: 'Chèque', icon: '📝' },
  VIREMENT: { label: 'Virement', icon: '🏦' }
};

export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Inconnu'
];

export const GENDER = {
  M: 'Masculin',
  F: 'Féminin',
  AUTRE: 'Autre'
};

export const APPOINTMENT_DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 heure' },
  { value: 90, label: '1h30' },
  { value: 120, label: '2 heures' }
];

export const MESSAGES = {
  SUCCESS: {
    PATIENT_CREATED: 'Patient créé avec succès',
    PATIENT_UPDATED: 'Patient mis à jour avec succès',
    PATIENT_DELETED: 'Patient supprimé avec succès',
    APPOINTMENT_CREATED: 'Rendez-vous créé avec succès',
    APPOINTMENT_UPDATED: 'Rendez-vous mis à jour avec succès',
    APPOINTMENT_CANCELLED: 'Rendez-vous annulé avec succès',
    PAYMENT_CREATED: 'Paiement enregistré avec succès',
    PAYMENT_UPDATED: 'Paiement mis à jour avec succès'
  },
  ERROR: {
    GENERIC: 'Une erreur est survenue',
    NETWORK: 'Erreur de connexion au serveur',
    UNAUTHORIZED: 'Accès non autorisé',
    NOT_FOUND: 'Ressource non trouvée',
    VALIDATION: 'Erreur de validation des données',
    CONFLICT: 'Conflit d\'horaire détecté'
  },
  CONFIRM: {
    DELETE_PATIENT: 'Êtes-vous sûr de vouloir supprimer ce patient ?',
    DELETE_APPOINTMENT: 'Êtes-vous sûr de vouloir supprimer ce rendez-vous ?',
    CANCEL_APPOINTMENT: 'Êtes-vous sûr de vouloir annuler ce rendez-vous ?'
  }
};

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PHONE_REGEX: /^(\+216)?[0-9]{8}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TIME_REGEX: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  MIN_AGE: 0,
  MAX_AGE: 150,
  MIN_APPOINTMENT_DURATION: 15,
  MAX_APPOINTMENT_DURATION: 180,
  MIN_PAYMENT_AMOUNT: 0
};

export const ROUTES = {
  // Public
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Patient
  PATIENT_DASHBOARD: '/patient/dashboard',
  PATIENT_PROFILE: '/patient/profile',
  PATIENT_APPOINTMENTS: '/patient/appointments',
  PATIENT_CONSULTATIONS: '/patient/consultations',
  PATIENT_DOCUMENTS: '/patient/documents',
  
  // Secrétaire
  SECRETAIRE_DASHBOARD: '/secretaire/dashboard',
  SECRETAIRE_PATIENTS: '/secretaire/patients',
  SECRETAIRE_NEW_PATIENT: '/secretaire/new-patient',
  SECRETAIRE_APPOINTMENTS: '/secretaire/appointments',
  SECRETAIRE_PAYMENTS: '/secretaire/payments',
  
  // Médecin
  MEDECIN_DASHBOARD: '/medecin/dashboard',
  MEDECIN_AGENDA: '/medecin/agenda',
  MEDECIN_CONSULTATIONS: '/medecin/consultations',
  MEDECIN_PATIENTS: '/medecin/patients'
};

// Helper pour obtenir le badge de statut
export const getStatusBadge = (statut, type = 'appointment') => {
  const badges = {
    appointment: {
      PREVU: { className: 'badge badge-info', label: 'Prévu' },
      REALISE: { className: 'badge badge-success', label: 'Réalisé' },
      ANNULE: { className: 'badge badge-danger', label: 'Annulé' }
    },
    payment: {
      PAYE: { className: 'badge badge-success', label: 'Payé' },
      PARTIEL: { className: 'badge badge-warning', label: 'Partiel' },
      IMPAYE: { className: 'badge badge-danger', label: 'Impayé' }
    }
  };
  
  return badges[type][statut] || { className: 'badge', label: statut };
};

// Helper pour formater les dates
export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  
  const formats = {
    short: d.toLocaleDateString('fr-FR'),
    long: d.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    time: d.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    full: `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`
  };
  
  return formats[format] || formats.short;
};

// Helper pour calculer l'âge
export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export default {
  ROLES,
  APPOINTMENT_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  BLOOD_TYPES,
  GENDER,
  APPOINTMENT_DURATIONS,
  MESSAGES,
  VALIDATION_RULES,
  ROUTES,
  getStatusBadge,
  formatDate,
  calculateAge
};