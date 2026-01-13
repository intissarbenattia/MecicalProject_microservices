const mongoose = require('mongoose');

const patientProfilSchema = new mongoose.Schema({
  idUtilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: [true, 'L\'ID utilisateur est requis'],
    unique: true
  },
  dateNaissance: {
    type: Date,
    required: [true, 'La date de naissance est requise']
  },
  sexe: {
    type: String,
    enum: ['M', 'F', 'Autre'],
    required: [true, 'Le sexe est requis']
  },
  adresse: {
    type: String,
    trim: true
  },
  numeroDossier: {
    type: String,
    unique: true
  },
  allergies: {
    type: String,
    default: 'Aucune'
  },
  antecedents: {
    type: String,
    default: 'Aucun'
  },
  groupeSanguin: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Inconnu'],
    default: 'Inconnu'
  },
  traitements: {
    type: String,
    default: 'Aucun'
  },
  vaccinations: {
    type: String,
    default: 'À compléter'
  },
  fichiersUploads: [{
    nom: String,
    url: String,
    type: String,
    dateUpload: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Méthode pour calculer l'âge
patientProfilSchema.methods.calculerAge = function() {
  const aujourdhui = new Date();
  const naissance = new Date(this.dateNaissance);
  let age = aujourdhui.getFullYear() - naissance.getFullYear();
  const mois = aujourdhui.getMonth() - naissance.getMonth();
  
  if (mois < 0 || (mois === 0 && aujourdhui.getDate() < naissance.getDate())) {
    age--;
  }
  
  return age;
};

module.exports = mongoose.model('PatientProfil', patientProfilSchema);