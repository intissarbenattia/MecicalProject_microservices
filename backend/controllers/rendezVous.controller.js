const RendezVous = require('../models/RendezVous');
const PatientProfil = require('../models/PatientProfil');
const MedecinProfil = require('../models/MedecinProfil');
const Utilisateur = require('../models/Utilisateur');
const { envoyerEmail, emailConfirmationRDV, emailAnnulationRDV } = require('../config/mailer');

// Planifier un rendez-vous
const planifierRendezVous = async (req, res) => {
  try {
    const {
      date,
      heure,
      motif,
      duree,
      idPatient,
      idMedecin
    } = req.body;

    const idSecretaireCreateur = req.userId;

    // Vérifier que le patient existe
    const patient = await PatientProfil.findById(idPatient).populate('idUtilisateur');
    if (!patient) {
      return res.status(404).json({
        error: 'Patient non trouvé'
      });
    }

    // Vérifier que le médecin existe
    const medecin = await MedecinProfil.findById(idMedecin).populate('idUtilisateur');
    if (!medecin) {
      return res.status(404).json({
        error: 'Médecin non trouvé'
      });
    }

    // Vérifier les conflits d'horaire
    const conflit = await RendezVous.findOne({
      date: new Date(date),
      heure,
      idMedecin,
      statut: { $ne: 'ANNULE' }
    });

    if (conflit) {
      return res.status(400).json({
        error: 'Conflit d\'horaire - Un rendez-vous existe déjà à cette date et heure pour ce médecin',
        rendezVousExistant: conflit
      });
    }

    // Créer le rendez-vous
    const rendezVous = new RendezVous({
      date: new Date(date),
      heure,
      motif,
      duree: duree || 30,
      idPatient,
      idMedecin,
      idSecretaireCreateur,
      statut: 'PREVU'
    });

    await rendezVous.save();
    await rendezVous.populate('idPatient idMedecin');

    // Envoyer email de confirmation au patient
    if (patient.idUtilisateur.email) {
      const nomPatient = `${patient.idUtilisateur.prenom} ${patient.idUtilisateur.nom}`;
      const nomMedecin = `${medecin.idUtilisateur.prenom} ${medecin.idUtilisateur.nom}`;
      const emailContent = emailConfirmationRDV(nomPatient, date, heure, nomMedecin);
      
      await envoyerEmail(
        patient.idUtilisateur.email,
        'Confirmation de votre rendez-vous',
        emailContent
      );
    }

    res.status(201).json({
      message: 'Rendez-vous planifié avec succès',
      rendezVous
    });
  } catch (error) {
    console.error('Erreur planifierRendezVous:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Conflit d\'horaire - Un rendez-vous existe déjà à cette date et heure'
      });
    }

    res.status(500).json({
      error: 'Erreur lors de la planification du rendez-vous',
      details: error.message
    });
  }
};

// Lire un rendez-vous
const lireRendezVous = async (req, res) => {
  try {
    const { id } = req.params;

    const rendezVous = await RendezVous.findById(id)
      .populate('idPatient')
      .populate('idMedecin')
      .populate('idSecretaireCreateur', 'nom prenom');

    if (!rendezVous) {
      return res.status(404).json({
        error: 'Rendez-vous non trouvé'
      });
    }

    res.json({
      rendezVous
    });
  } catch (error) {
    console.error('Erreur lireRendezVous:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du rendez-vous',
      details: error.message
    });
  }
};

// Lister les rendez-vous
const listerRendezVous = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      idMedecin, 
      idPatient, 
      statut, 
      dateDebut, 
      dateFin 
    } = req.query;

    const query = {};

    if (idMedecin) query.idMedecin = idMedecin;
    if (idPatient) query.idPatient = idPatient;
    if (statut) query.statut = statut;
    
    if (dateDebut || dateFin) {
      query.date = {};
      if (dateDebut) query.date.$gte = new Date(dateDebut);
      if (dateFin) query.date.$lte = new Date(dateFin);
    }

    const rendezVous = await RendezVous.find(query)
      .populate('idPatient')
      .populate('idMedecin')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: 1, heure: 1 });

    const count = await RendezVous.countDocuments(query);

    res.json({
      rendezVous,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Erreur listerRendezVous:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des rendez-vous',
      details: error.message
    });
  }
};

// Confirmer un rendez-vous
const confirmerRendezVous = async (req, res) => {
  try {
    const { id } = req.params;

    const rendezVous = await RendezVous.findById(id);

    if (!rendezVous) {
      return res.status(404).json({
        error: 'Rendez-vous non trouvé'
      });
    }

    if (rendezVous.statut !== 'PREVU') {
      return res.status(400).json({
        error: `Impossible de confirmer un rendez-vous avec le statut ${rendezVous.statut}`
      });
    }

    rendezVous.statut = 'REALISE';
    await rendezVous.save();

    res.json({
      message: 'Rendez-vous confirmé avec succès',
      rendezVous
    });
  } catch (error) {
    console.error('Erreur confirmerRendezVous:', error);
    res.status(500).json({
      error: 'Erreur lors de la confirmation du rendez-vous',
      details: error.message
    });
  }
};

// Annuler un rendez-vous (avec email)
const annulerRendezVous = async (req, res) => {
  try {
    const { id } = req.params;
    const { raison } = req.body;

    const rendezVous = await RendezVous.findById(id)
      .populate({
        path: 'idPatient',
        populate: { path: 'idUtilisateur' }
      });

    if (!rendezVous) {
      return res.status(404).json({
        error: 'Rendez-vous non trouvé'
      });
    }

    if (rendezVous.statut === 'REALISE') {
      return res.status(400).json({
        error: 'Impossible d\'annuler un rendez-vous déjà réalisé'
      });
    }

    if (rendezVous.statut === 'ANNULE') {
      return res.status(400).json({
        error: 'Ce rendez-vous est déjà annulé'
      });
    }

    rendezVous.statut = 'ANNULE';
    rendezVous.raisonAnnulation = raison || 'Non spécifiée';
    await rendezVous.save();

    // Envoyer email d'annulation au patient
    if (rendezVous.idPatient.idUtilisateur.email) {
      const nomPatient = `${rendezVous.idPatient.idUtilisateur.prenom} ${rendezVous.idPatient.idUtilisateur.nom}`;
      const emailContent = emailAnnulationRDV(nomPatient, rendezVous.date, rendezVous.heure);
      
      await envoyerEmail(
        rendezVous.idPatient.idUtilisateur.email,
        'Annulation de votre rendez-vous',
        emailContent
      );
    }

    res.json({
      message: 'Rendez-vous annulé avec succès',
      rendezVous
    });
  } catch (error) {
    console.error('Erreur annulerRendezVous:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'annulation du rendez-vous',
      details: error.message
    });
  }
};

// Reprogrammer un rendez-vous
const reprogrammerRendezVous = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, heure } = req.body;

    if (!date || !heure) {
      return res.status(400).json({
        error: 'La nouvelle date et heure sont requises'
      });
    }

    const rendezVous = await RendezVous.findById(id);

    if (!rendezVous) {
      return res.status(404).json({
        error: 'Rendez-vous non trouvé'
      });
    }

    if (rendezVous.statut === 'REALISE') {
      return res.status(400).json({
        error: 'Impossible de reprogrammer un rendez-vous déjà réalisé'
      });
    }

    // Vérifier les conflits
    const conflit = await RendezVous.findOne({
      _id: { $ne: id },
      date: new Date(date),
      heure,
      idMedecin: rendezVous.idMedecin,
      statut: { $ne: 'ANNULE' }
    });

    if (conflit) {
      return res.status(400).json({
        error: 'Conflit d\'horaire - Un rendez-vous existe déjà à cette nouvelle date et heure',
        rendezVousExistant: conflit
      });
    }

    rendezVous.date = new Date(date);
    rendezVous.heure = heure;
    rendezVous.statut = 'PREVU';

    await rendezVous.save();

    res.json({
      message: 'Rendez-vous reprogrammé avec succès',
      rendezVous
    });
  } catch (error) {
    console.error('Erreur reprogrammerRendezVous:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Conflit d\'horaire - Un rendez-vous existe déjà à cette nouvelle date et heure'
      });
    }

    res.status(500).json({
      error: 'Erreur lors de la reprogrammation du rendez-vous',
      details: error.message
    });
  }
};

// Vérifier les conflits
const verifierConflits = async (req, res) => {
  try {
    const { date, heure, idMedecin, rdvId } = req.query;

    if (!date || !heure || !idMedecin) {
      return res.status(400).json({
        error: 'Date, heure et idMedecin sont requis'
      });
    }

    const query = {
      date: new Date(date),
      heure,
      idMedecin,
      statut: { $ne: 'ANNULE' }
    };

    if (rdvId) {
      query._id = { $ne: rdvId };
    }

    const conflit = await RendezVous.findOne(query).populate('idPatient');

    if (conflit) {
      return res.json({
        conflit: true,
        message: 'Un rendez-vous existe déjà à cet horaire',
        rendezVous: conflit
      });
    }

    res.json({
      conflit: false,
      message: 'Aucun conflit détecté, créneau disponible'
    });
  } catch (error) {
    console.error('Erreur verifierConflits:', error);
    res.status(500).json({
      error: 'Erreur lors de la vérification des conflits',
      details: error.message
    });
  }
};

// Supprimer un rendez-vous
const supprimerRendezVous = async (req, res) => {
  try {
    const { id } = req.params;

    const rendezVous = await RendezVous.findById(id);

    if (!rendezVous) {
      return res.status(404).json({
        error: 'Rendez-vous non trouvé'
      });
    }

    if (rendezVous.statut === 'REALISE') {
      return res.status(400).json({
        error: 'Impossible de supprimer un rendez-vous déjà réalisé',
        conseil: 'Utilisez l\'annulation à la place'
      });
    }

    await RendezVous.findByIdAndDelete(id);

    res.json({
      message: 'Rendez-vous supprimé avec succès',
      rendezVousSupprime: {
        id: rendezVous._id,
        date: rendezVous.date,
        heure: rendezVous.heure
      }
    });
  } catch (error) {
    console.error('Erreur supprimerRendezVous:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression du rendez-vous',
      details: error.message
    });
  }
};

module.exports = {
  planifierRendezVous,
  lireRendezVous,
    listerRendezVous,
    confirmerRendezVous,
    annulerRendezVous,
    reprogrammerRendezVous,
    verifierConflits,
    supprimerRendezVous
};