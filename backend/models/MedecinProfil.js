const mongoose = require('mongoose');

const medecinProfilSchema = new mongoose.Schema({
  idUtilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: [true, 'L\'ID utilisateur est requis'],
    unique: true
  },
  specialite: {
    type: String,
    required: [true, 'La spécialité est requise'],
    trim: true
  },
  numeroOrdre: {
    type: String,
    required: [true, 'Le numéro d\'ordre est requis'],
    unique: true,
    trim: true
  },
  tarifConsultation: {
    type: Number,
    required: [true, 'Le tarif de consultation est requis'],
    min: [0, 'Le tarif ne peut pas être négatif']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MedecinProfil', medecinProfilSchema);