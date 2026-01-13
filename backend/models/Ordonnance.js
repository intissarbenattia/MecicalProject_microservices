const mongoose = require('mongoose');

const ordonnanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'La date est requise'],
    default: Date.now
  },
  medicaments: {
    type: String,
    required: [true, 'Les médicaments sont requis'],
    trim: true
  },
  posologie: {
    type: String,
    required: [true, 'La posologie est requise'],
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

module.exports = mongoose.model('Ordonnance', ordonnanceSchema);