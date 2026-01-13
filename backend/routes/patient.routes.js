const express = require('express');
const router = express.Router();
const {creerPatient,
  lirePatient,
    mettreAJourPatient,
    listerPatients,
    voirProchainsRendezVous,
    supprimerPatient,
    uploadFichier,
    supprimerFichier} = require('../controllers/patient.controller');
const {verifyToken} = require('../middleware/auth.middleware');
const {body} = require('express-validator');


// Validation pour la création d'un patient
const createPatientValidation = [
  body('idUtilisateur').notEmpty().withMessage('L\'ID utilisateur est requis'),
  body('dateNaissance').isISO8601().withMessage('Date de naissance invalide'),
  body('sexe').isIn(['M', 'F', 'Autre']).withMessage('Sexe invalide'),
  body('numeroDossier').optional().trim()
];

// Validation pour la mise à jour
const updatePatientValidation = [
  body('dateNaissance').optional().isISO8601().withMessage('Date de naissance invalide'),
  body('sexe').optional().isIn(['M', 'F', 'Autre']).withMessage('Sexe invalide'),
  body('groupeSanguin').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Inconnu']).withMessage('Groupe sanguin invalide')
];

// Validation pour upload fichier
const uploadFichierValidation = [
  body('nom').notEmpty().withMessage('Le nom du fichier est requis'),
  body('url').notEmpty().withMessage('L\'URL du fichier est requise'),
  body('type').notEmpty().withMessage('Le type du fichier est requis')
];


// Routes - Toutes protégées
router.post('/', verifyToken, createPatientValidation, creerPatient);
router.get('/', verifyToken, listerPatients);
router.get('/:id', verifyToken, lirePatient);
router.put('/:id', verifyToken, updatePatientValidation, mettreAJourPatient);
router.delete('/:id', verifyToken, supprimerPatient);

// Rendez-vous du patient
router.get('/:id/rendez-vous', verifyToken, voirProchainsRendezVous);

// Gestion des fichiers
router.post('/:id/fichiers', verifyToken, uploadFichierValidation, uploadFichier);
router.delete('/:id/fichiers/:fichierId', verifyToken, supprimerFichier);


module.exports = router;