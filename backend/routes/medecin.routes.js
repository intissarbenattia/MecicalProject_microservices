const express = require('express');
const router = express.Router();
const {creerMedecin,
  lireMedecin,
    mettreAJourMedecin,
    listerMedecins,
    obtenirAgenda,
    verifierDisponibilite} = require('../controllers/medecin.controller');
const {verifyToken} = require('../middleware/auth.middleware');
const {body} = require('express-validator');

// Validation pour la création d'un médecin
const createMedecinValidation = [
  body('idUtilisateur').notEmpty().withMessage('L\'ID utilisateur est requis'),
  body('specialite').trim().notEmpty().withMessage('La spécialité est requise'),
  body('numeroOrdre').trim().notEmpty().withMessage('Le numéro d\'ordre est requis'),
  body('tarifConsultation').isFloat({ min: 0 }).withMessage('Le tarif doit être un nombre positif')
];

// Validation pour la mise à jour
const updateMedecinValidation = [
  body('specialite').optional().trim().notEmpty().withMessage('La spécialité ne peut pas être vide'),
  body('tarifConsultation').optional().isFloat({ min: 0 }).withMessage('Le tarif doit être un nombre positif')
];

// Routes - Toutes protégées
router.post('/', verifyToken, createMedecinValidation, creerMedecin);
router.get('/', verifyToken, listerMedecins);
router.get('/:id', verifyToken, lireMedecin);
router.put('/:id', verifyToken, updateMedecinValidation, mettreAJourMedecin);

// Agenda et disponibilité
router.get('/:id/agenda', verifyToken, obtenirAgenda);
router.get('/:id/disponibilite', verifyToken, verifierDisponibilite);

module.exports = router;