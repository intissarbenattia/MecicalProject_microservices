const express = require('express');
const router = express.Router();
const {creerConsultation,
  lireConsultation,
    mettreAJourConsultation,
    listerConsultations,
    creerOrdonnance,
    lireOrdonnance,
    mettreAJourOrdonnance,
    creerCertificat,
    lireCertificat,
    mettreAJourCertificat} = require('../controllers/consultation.controller');
const {verifyToken} = require('../middleware/auth.middleware');
const {body} = require('express-validator');

// Validation pour la création d'une consultation
const createConsultationValidation = [
  body('type').isIn(['NORMALE', 'CONTROLE', 'URGENCE']).withMessage('Type de consultation invalide'),
  body('motif').trim().notEmpty().withMessage('Le motif est requis'),
  body('montant').isFloat({ min: 0 }).withMessage('Le montant doit être un nombre positif'),
  body('idPatient').notEmpty().withMessage('L\'ID patient est requis'),
  body('idMedecin').notEmpty().withMessage('L\'ID médecin est requis'),
  body('dateConsultation').optional().isISO8601().withMessage('Date de consultation invalide')
];

// Validation pour la mise à jour
const updateConsultationValidation = [
  body('type').optional().isIn(['NORMALE', 'CONTROLE', 'URGENCE']).withMessage('Type de consultation invalide'),
  body('diagnostic').optional().trim(),
  body('observations').optional().trim(),
  body('poids').optional().isFloat({ min: 0 }).withMessage('Le poids doit être positif'),
  body('taille').optional().isFloat({ min: 0 }).withMessage('La taille doit être positive'),
  body('montant').optional().isFloat({ min: 0 }).withMessage('Le montant doit être positif')
];

// Validation pour les ordonnances
const createOrdonnanceValidation = [
  body('medicaments').trim().notEmpty().withMessage('Les médicaments sont requis'),
  body('posologie').trim().notEmpty().withMessage('La posologie est requise'),
  body('idConsultation').notEmpty().withMessage('L\'ID consultation est requis')
];

const updateOrdonnanceValidation = [
  body('medicaments').optional().trim().notEmpty().withMessage('Les médicaments ne peuvent pas être vides'),
  body('posologie').optional().trim().notEmpty().withMessage('La posologie ne peut pas être vide')
];

// Validation pour les certificats
const createCertificatValidation = [
  body('type').trim().notEmpty().withMessage('Le type de certificat est requis'),
  body('contenu').trim().notEmpty().withMessage('Le contenu est requis'),
  body('idConsultation').notEmpty().withMessage('L\'ID consultation est requis')
];

const updateCertificatValidation = [
  body('type').optional().trim().notEmpty().withMessage('Le type ne peut pas être vide'),
  body('contenu').optional().trim().notEmpty().withMessage('Le contenu ne peut pas être vide')
];

// Routes Consultations
router.post('/', verifyToken, createConsultationValidation, creerConsultation);
router.get('/', verifyToken, listerConsultations);
router.get('/:id', verifyToken, lireConsultation);
router.put('/:id', verifyToken, updateConsultationValidation, mettreAJourConsultation);

// Routes Ordonnances
router.post('/ordonnances', verifyToken, createOrdonnanceValidation, creerOrdonnance);
router.get('/ordonnances/:id', verifyToken, lireOrdonnance);
router.put('/ordonnances/:id', verifyToken, updateOrdonnanceValidation, mettreAJourOrdonnance);

// Routes Certificats
router.post('/certificats', verifyToken, createCertificatValidation, creerCertificat);
router.get('/certificats/:id', verifyToken, lireCertificat);
router.put('/certificats/:id', verifyToken, updateCertificatValidation, mettreAJourCertificat);


module.exports = router;