const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {register,
  login,
    getProfile,
    mettreAJourUtilisateur} = require('../controllers/auth.controller');
const {verifyToken} = require('../middleware/auth.middleware');
const { body } = require('express-validator');


// Validation pour l'inscription
const registerValidation = [
  body('nom').trim().notEmpty().withMessage('Le nom est requis'),
  body('prenom').trim().notEmpty().withMessage('Le prénom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('mdp').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role').isIn(['MEDECIN', 'SECRETAIRE', 'PATIENT']).withMessage('Rôle invalide')
];

// Validation pour la connexion
const loginValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('mdp').notEmpty().withMessage('Le mot de passe est requis')
];

// Validation pour la mise à jour
const updateValidation = [
  body('nom').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('prenom').optional().trim().notEmpty().withMessage('Le prénom ne peut pas être vide'),
  body('email').optional().isEmail().withMessage('Email invalide')
];

// Validation pour le changement de mot de passe
const changePasswordValidation = [
  body('ancienMdp').notEmpty().withMessage('L\'ancien mot de passe est requis'),
  body('nouveauMdp').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
];

// Routes publiques
router.post('/register', registerValidation, register);
router.post('/login', loginValidation,login);
// Routes protégées
router.get('/profile',verifyToken, getProfile);
router.put('/utilisateur/:id', verifyToken,updateValidation ,mettreAJourUtilisateur);
router.put('/utilisateur', verifyToken,updateValidation ,mettreAJourUtilisateur);

// Google OAuth - Redirection vers Google
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

// Google OAuth - Callback
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/login' 
  }),
  (req, res) => {
    // Générer JWT pour l'utilisateur Google
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Rediriger vers le frontend avec le token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);


module.exports = router;