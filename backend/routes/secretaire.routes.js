const express = require('express');
const router = express.Router();
const {creerSecretaire,
  lireSecretaire,
  mettreAJourSecretaire} = require('../controllers/secretaire.controller');
const {verifyToken} = require('../middleware/auth.middleware');
const {body} = require('express-validator');

// Validation pour la création d'un secrétaire
const createSecretaireValidation = [
  body('idUtilisateur').notEmpty().withMessage('L\'ID utilisateur est requis'),
  body('dateEmbauche').optional().isISO8601().withMessage('Date d\'embauche invalide'),
  body('fonction').optional().trim()
];

// Validation pour la mise à jour
const updateSecretaireValidation = [
  body('dateEmbauche').optional().isISO8601().withMessage('Date d\'embauche invalide'),
  body('fonction').optional().trim().notEmpty().withMessage('La fonction ne peut pas être vide')
];

// Routes - Toutes protégées
router.post('/', verifyToken, createSecretaireValidation, creerSecretaire);
router.get('/', verifyToken, lireSecretaire);
router.put('/', verifyToken, updateSecretaireValidation, mettreAJourSecretaire);


module.exports = router;