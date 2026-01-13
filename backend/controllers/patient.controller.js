const PatientProfil = require('../models/PatientProfil');
const RendezVous = require('../models/RendezVous');

// Créer un patient
const creerPatient = async (req, res) => {
  try {
    const {
      idUtilisateur,
      dateNaissance,
      sexe,
      adresse,
      numeroDossier,
      allergies,
      antecedents,
      groupeSanguin,
      traitements,
      vaccinations
    } = req.body;

    const patientExistant = await PatientProfil.findOne({ idUtilisateur });
    if (patientExistant) {
      return res.status(400).json({
        error: 'Un profil patient existe déjà pour cet utilisateur'
      });
    }

    // Générer le numéro de dossier si non fourni
    let dossierNumero = numeroDossier;
    if (!dossierNumero) {
      const count = await PatientProfil.countDocuments();
      dossierNumero = `PAT${String(count + 1).padStart(6, '0')}`;
    }

    const patient = new PatientProfil({
      idUtilisateur,
      dateNaissance,
      sexe,
      adresse,
      numeroDossier: dossierNumero,
      allergies: allergies || 'Aucune',
      antecedents: antecedents || 'Aucun',
      groupeSanguin: groupeSanguin || 'Inconnu',
      traitements: traitements || 'Aucun',
      vaccinations: vaccinations || 'À compléter'
    });

    await patient.save();

    res.status(201).json({
      message: 'Patient créé avec succès',
      patient
    });
  } catch (error) {
    console.error('Erreur creerPatient:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du patient',
      details: error.message
    });
  }
};

// Lire un patient
const lirePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await PatientProfil.findById(id).populate('idUtilisateur', 'nom prenom email');

    if (!patient) {
      return res.status(404).json({
        error: 'Patient non trouvé'
      });
    }

    const patientData = patient.toObject();
    patientData.age = patient.calculerAge();

    res.json({
      patient: patientData
    });
  } catch (error) {
    console.error('Erreur lirePatient:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du patient',
      details: error.message
    });
  }
};

// Mettre à jour un patient
const mettreAJourPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.idUtilisateur;
    delete updateData.numeroDossier;

    const patient = await PatientProfil.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('idUtilisateur', 'nom prenom email');

    if (!patient) {
      return res.status(404).json({
        error: 'Patient non trouvé'
      });
    }

    res.json({
      message: 'Patient mis à jour avec succès',
      patient
    });
  } catch (error) {
    console.error('Erreur mettreAJourPatient:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du patient',
      details: error.message
    });
  }
};

// Lister tous les patients
const listerPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = {};
    if (search) {
      query.numeroDossier = { $regex: search, $options: 'i' };
    }

    const patients = await PatientProfil.find(query)
      .populate('idUtilisateur', 'nom prenom email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await PatientProfil.countDocuments(query);

    res.json({
      patients,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Erreur listerPatients:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des patients',
      details: error.message
    });
  }
};

// Voir les prochains rendez-vous d'un patient
const voirProchainsRendezVous = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await PatientProfil.findById(id).populate('idUtilisateur', 'nom prenom');
    if (!patient) {
      return res.status(404).json({
        error: 'Patient non trouvé'
      });
    }

    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    const rendezVous = await RendezVous.find({
      idPatient: id,
      date: { $gte: aujourdhui },
      statut: 'PREVU'
    })
    .populate('idMedecin')
    .sort({ date: 1, heure: 1 })
    .limit(10);

    res.json({
      patient: {
        id: patient._id,
        nom: patient.idUtilisateur.nom,
        prenom: patient.idUtilisateur.prenom,
        numeroDossier: patient.numeroDossier
      },
      prochainsRendezVous: rendezVous,
      total: rendezVous.length
    });
  } catch (error) {
    console.error('Erreur voirProchainsRendezVous:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des rendez-vous',
      details: error.message
    });
  }
};

// Supprimer un patient
const supprimerPatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await PatientProfil.findById(id);
    if (!patient) {
      return res.status(404).json({
        error: 'Patient non trouvé'
      });
    }

    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    const rdvAvenir = await RendezVous.countDocuments({
      idPatient: id,
      date: { $gte: aujourdhui },
      statut: 'PREVU'
    });

    if (rdvAvenir > 0) {
      return res.status(400).json({
        error: `Impossible de supprimer le patient. Il a ${rdvAvenir} rendez-vous à venir.`,
        conseil: 'Veuillez d\'abord annuler tous ses rendez-vous.'
      });
    }

    await PatientProfil.findByIdAndDelete(id);

    res.json({
      message: 'Patient supprimé avec succès',
      patientSupprime: {
        id: patient._id,
        numeroDossier: patient.numeroDossier
      }
    });
  } catch (error) {
    console.error('Erreur supprimerPatient:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression du patient',
      details: error.message
    });
  }
};

// Upload fichier
const uploadFichier = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, url, type } = req.body;

    const patient = await PatientProfil.findById(id);

    if (!patient) {
      return res.status(404).json({
        error: 'Patient non trouvé'
      });
    }

    patient.fichiersUploads.push({ nom, url, type });
    await patient.save();

    res.json({
      message: 'Fichier ajouté avec succès',
      patient
    });
  } catch (error) {
    console.error('Erreur uploadFichier:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'ajout du fichier',
      details: error.message
    });
  }
};

// Supprimer fichier
const supprimerFichier = async (req, res) => {
  try {
    const { id, fichierId } = req.params;

    const patient = await PatientProfil.findById(id);

    if (!patient) {
      return res.status(404).json({
        error: 'Patient non trouvé'
      });
    }

    patient.fichiersUploads = patient.fichiersUploads.filter(
      f => f._id.toString() !== fichierId
    );

    await patient.save();

    res.json({
      message: 'Fichier supprimé avec succès',
      patient
    });
  } catch (error) {
    console.error('Erreur supprimerFichier:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression du fichier',
      details: error.message
    });
  }
};

module.exports = {
  creerPatient,
  lirePatient,
    mettreAJourPatient,
    listerPatients,
    voirProchainsRendezVous,
    supprimerPatient,
    uploadFichier,
    supprimerFichier
};