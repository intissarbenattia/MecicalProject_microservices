const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true,
    },
    prenom: {
        type: String,
        required: [true, 'Le prénom est requis'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Veuillez fournir un email valide'],
    },
    mdp: {
        type: String,
        required: function() {
      return !this.googleId; // Mot de passe requis seulement si pas de Google
    },
        minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
    },
     googleId: {
    type: String,
    unique: true,
    sparse: true
  },
    role: {
        type: String,
        enum: ['MEDECIN', 'SECRETAIRE', 'PATIENT'],
        required: [true, 'Le rôle est requis'],

    },
    actif: {
        type: Boolean,
        default: true,
    },
    dateCreation: {
        type: Date,
        default: Date.now,
    },
},{
    timestamps: true,
});

// Pas de hash pour le développement
utilisateurSchema.methods.comparerMotDePasse = async function(mdpCandidat) {
  return mdpCandidat === this.mdp;
};
utilisateurSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.mdp;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Utilisateur', utilisateurSchema);

