const express = require('express');
const router = express.Router();
const {planifierRendezVous,
  lireRendezVous,
    listerRendezVous,
    confirmerRendezVous,
    annulerRendezVous,
    reprogrammerRendezVous,
    verifierConflits,
    supprimerRendezVous} = require('../controllers/rendezVous.controller');
const {verifyToken} = require('../middleware/auth.middleware');
const {body} = require('express-validator');

// Validation pour la création d'un rendez-vous
const createRdvValidation = [
  body('date').isISO8601().withMessage('Date invalide'),
  body('heure').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure invalide (format HH:mm)'),
  body('motif').trim().notEmpty().withMessage('Le motif est requis'),
  body('idPatient').notEmpty().withMessage('L\'ID patient est requis'),
  body('idMedecin').notEmpty().withMessage('L\'ID médecin est requis'),
  body('duree').optional().isInt({ min: 15, max: 180 }).withMessage('Durée invalide (15-180 minutes)')
];

// Validation pour la reprogrammation
const reprogrammerValidation = [
  body('date').isISO8601().withMessage('Date invalide'),
  body('heure').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure invalide (format HH:mm)')
];

// Validation pour l'annulation
const annulerValidation = [
  body('raison').optional().trim()
];

// Routes - Toutes protégées
router.post('/', verifyToken, createRdvValidation, planifierRendezVous);
router.get('/', verifyToken, listerRendezVous);
router.get('/verifier-conflits', verifyToken, verifierConflits);
router.get('/:id', verifyToken, lireRendezVous);
router.put('/:id/confirmer', verifyToken, confirmerRendezVous);
router.put('/:id/annuler', verifyToken, annulerValidation, annulerRendezVous);
router.put('/:id/reprogrammer', verifyToken, reprogrammerValidation, reprogrammerRendezVous);
router.delete('/:id', verifyToken, supprimerRendezVous);



module.exports = router;