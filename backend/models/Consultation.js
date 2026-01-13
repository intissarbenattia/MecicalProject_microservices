const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  dateConsultation: {
    type: Date,
    required: [true, 'La date de consultation est requise'],
    default: Date.now
  },
  type: {
    type: String,
    enum: ['NORMALE', 'CONTROLE', 'URGENCE'],
    required: [true, 'Le type de consultation est requis']
  },
  motif: {
    type: String,
    required: [true, 'Le motif est requis'],
    trim: true
  },
  diagnostic: {
    type: String,
    trim: true
  },
  observations: {
    type: String,
    trim: true
  },
  poids: {
    type: Number,
    min: [0, 'Le poids ne peut pas être négatif']
  },
  taille: {
    type: Number,
    min: [0, 'La taille ne peut pas être négative']
  },
  pressionArterielle: {
    type: String,
    trim: true
  },
  montant: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0, 'Le montant ne peut pas être négatif']
  },
  idPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PatientProfil',
    required: [true, 'L\'ID patient est requis']
  },
  idMedecin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedecinProfil',
    required: [true, 'L\'ID médecin est requis']
  },
  idRendezVous: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RendezVous'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Consultation', consultationSchema);