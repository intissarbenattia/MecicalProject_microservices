const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'La date est requise'],
    default: Date.now
  },
  montant: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0, 'Le montant ne peut pas être négatif']
  },
  modePaiement: {
    type: String,
    required: [true, 'Le mode de paiement est requis'],
    enum: ['ESPECES', 'CARTE', 'CHEQUE', 'VIREMENT']
  },
  statut: {
    type: String,
    enum: ['PAYE', 'PARTIEL', 'IMPAYE'],
    default: 'PAYE'
  },
  idConsultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: [true, 'L\'ID consultation est requis']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Paiement', paiementSchema);