const mongoose = require('mongoose');

const rendezVousSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'La date est requise'],
    index: true
  },
  heure: {
    type: String,
    required: [true, 'L\'heure est requise'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:mm)']
  },
  motif: {
    type: String,
    required: [true, 'Le motif est requis'],
    trim: true
  },
  statut: {
    type: String,
    enum: ['PREVU', 'ANNULE', 'REALISE'],
    default: 'PREVU',
    index: true
  },
  duree: {
    type: Number,
    default: 30,
    min: [15, 'La durée minimum est de 15 minutes'],
    max: [180, 'La durée maximum est de 180 minutes']
  },
  idPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PatientProfil',
    required: [true, 'L\'ID patient est requis'],
    index: true
  },
  idMedecin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedecinProfil',
    required: [true, 'L\'ID médecin est requis'],
    index: true
  },
  idSecretaireCreateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: [true, 'L\'ID secrétaire créateur est requis']
  },
  raisonAnnulation: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index composé pour éviter les doublons
rendezVousSchema.index({ date: 1, heure: 1, idMedecin: 1 }, { unique: true });

module.exports = mongoose.model('RendezVous', rendezVousSchema);