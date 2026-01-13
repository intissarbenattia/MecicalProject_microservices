const mongoose = require('mongoose');

const certificatSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'La date est requise'],
    default: Date.now
  },
  type: {
    type: String,
    required: [true, 'Le type de certificat est requis'],
    trim: true
  },
  contenu: {
    type: String,
    required: [true, 'Le contenu est requis'],
    trim: true
  },
  idConsultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: [true, 'L\'ID consultation est requis']
  },
  idMedecin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedecinProfil',
    required: [true, 'L\'ID médecin est requis']
  },
  pdfUrl: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificat', certificatSchema);