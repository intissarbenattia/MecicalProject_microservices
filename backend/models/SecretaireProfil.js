const mongoose = require('mongoose');

const secretaireProfilSchema = new mongoose.Schema({
  idUtilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: [true, 'L\'ID utilisateur est requis'],
    unique: true
  },
  dateEmbauche: {
    type: Date,
    required: [true, 'La date d\'embauche est requise'],
    default: Date.now
  },
  fonction: {
    type: String,
    required: [true, 'La fonction est requise'],
    trim: true,
    default: 'Secrétaire médicale'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SecretaireProfil', secretaireProfilSchema);