const express = require('express');
const router = express.Router();
const {effectuerPaiement,
  lirePaiement,
    mettreAJourPaiement,
    listerPaiements,
    statistiquesPaiements} = require('../controllers/paiement.controller');
const {verifyToken} = require('../middleware/auth.middleware');
const {body} = require('express-validator');

// Validation pour la création d'un paiement
const createPaiementValidation = [
  body('montant').isFloat({ min: 0 }).withMessage('Le montant doit être un nombre positif'),
  body('modePaiement').isIn(['ESPECES', 'CARTE', 'CHEQUE', 'VIREMENT']).withMessage('Mode de paiement invalide'),
  body('statut').optional().isIn(['PAYE', 'PARTIEL', 'IMPAYE']).withMessage('Statut invalide'),
  body('idConsultation').notEmpty().withMessage('L\'ID consultation est requis')
];

// Validation pour la mise à jour
const updatePaiementValidation = [
  body('montant').optional().isFloat({ min: 0 }).withMessage('Le montant doit être un nombre positif'),
  body('modePaiement').optional().isIn(['ESPECES', 'CARTE', 'CHEQUE', 'VIREMENT']).withMessage('Mode de paiement invalide'),
  body('statut').optional().isIn(['PAYE', 'PARTIEL', 'IMPAYE']).withMessage('Statut invalide')
];


// Routes - Toutes protégées
router.post('/', verifyToken, createPaiementValidation, effectuerPaiement);
router.get('/', verifyToken, listerPaiements);
router.get('/statistiques', verifyToken, statistiquesPaiements);
router.get('/:id', verifyToken, lirePaiement);
router.put('/:id', verifyToken, updatePaiementValidation, mettreAJourPaiement);


module.exports = router;