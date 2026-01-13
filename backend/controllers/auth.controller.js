const Utilisateur = require('../models/Utilisateur');
const jwt = require('jsonwebtoken');

// Générer un token JWT
const genererToken = (utilisateur) => {
  return jwt.sign(
    {
      id: utilisateur._id,
      email: utilisateur.email,
      role: utilisateur.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Inscription
const register = async (req, res) => {
  try {
    const { nom, prenom, email, mdp, role } = req.body;

    const utilisateurExistant = await Utilisateur.findOne({ email });
    if (utilisateurExistant) {
      return res.status(400).json({
        error: 'Un utilisateur avec cet email existe déjà'
      });
    }

    const utilisateur = new Utilisateur({
      nom,
      prenom,
      email,
      mdp,
      role
    });

    await utilisateur.save();

    const token = genererToken(utilisateur);

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de l\'utilisateur',
      details: error.message
    });
  }
};

// Connexion
const login = async (req, res) => {
  try {
    const { email, mdp } = req.body;

    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    if (!utilisateur.actif) {
      return res.status(403).json({
        error: 'Compte désactivé'
      });
    }

    const mdpValide = await utilisateur.comparerMotDePasse(mdp);
    if (!mdpValide) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    const token = genererToken(utilisateur);

    res.json({
      message: 'Connexion réussie',
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      error: 'Erreur lors de la connexion',
      details: error.message
    });
  }
};

// Récupérer le profil utilisateur
const getProfile = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.userId);
    
    if (!utilisateur) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      utilisateur
    });
  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du profil'
    });
  }
};

// Mettre à jour l'utilisateur
const mettreAJourUtilisateur = async (req, res) => {
  try {
    const { nom, prenom, email } = req.body;
    const userId = req.params.id || req.userId;

    if (userId !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que votre propre profil'
      });
    }

    if (email) {
      const emailExiste = await Utilisateur.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      if (emailExiste) {
        return res.status(400).json({
          error: 'Cet email est déjà utilisé'
        });
      }
    }

    const updateData = {};
    if (nom) updateData.nom = nom;
    if (prenom) updateData.prenom = prenom;
    if (email) updateData.email = email;

    const utilisateur = await Utilisateur.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!utilisateur) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      message: 'Profil mis à jour avec succès',
      utilisateur
    });
  } catch (error) {
    console.error('Erreur mettreAJourUtilisateur:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du profil',
      details: error.message
    });
  }
};



module.exports = {
  register,
  login,
    getProfile,
    mettreAJourUtilisateur
};