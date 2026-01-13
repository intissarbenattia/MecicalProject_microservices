const MedecinProfil = require('../models/MedecinProfil');
const RendezVous = require('../models/RendezVous');

// Créer un profil médecin
const creerMedecin = async (req, res) => {
  try {
    const { idUtilisateur, specialite, numeroOrdre, tarifConsultation } = req.body;

    const medecinExistant = await MedecinProfil.findOne({ idUtilisateur });
    if (medecinExistant) {
      return res.status(400).json({
        error: 'Un profil médecin existe déjà pour cet utilisateur'
      });
    }

    const numeroExistant = await MedecinProfil.findOne({ numeroOrdre });
    if (numeroExistant) {
      return res.status(400).json({
        error: 'Ce numéro d\'ordre est déjà utilisé'
      });
    }

    const medecin = new MedecinProfil({
      idUtilisateur,
      specialite,
      numeroOrdre,
      tarifConsultation
    });

    await medecin.save();

    res.status(201).json({
      message: 'Profil médecin créé avec succès',
      medecin
    });
  } catch (error) {
    console.error('Erreur creerMedecin:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du profil médecin',
      details: error.message
    });
  }
};

const obtenirMonProfil = async (req, res) => {
  try {
    // L'ID utilisateur vient du token JWT décodé dans le middleware
    const idUtilisateur = req.user.id;

    const medecin = await MedecinProfil.findOne({ idUtilisateur })
      .populate('idUtilisateur', 'nom prenom email telephone');

    if (!medecin) {
      return res.status(404).json({
        error: 'Profil médecin non trouvé',
        message: 'Vous devez créer votre profil médecin'
      });
    }

    res.json({
      medecin
    });
  } catch (error) {
    console.error('Erreur obtenirMonProfil:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du profil',
      details: error.message
    });
  }
};

// Lire un profil médecin
const lireMedecin = async (req, res) => {
  try {
    const { id } = req.params;

    const medecin = await MedecinProfil.findById(id).populate('idUtilisateur', 'nom prenom email');

    if (!medecin) {
      return res.status(404).json({
        error: 'Profil médecin non trouvé'
      });
    }

    res.json({
      medecin
    });
  } catch (error) {
    console.error('Erreur lireMedecin:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du profil médecin',
      details: error.message
    });
  }
};

// Mettre à jour un profil médecin
const mettreAJourMedecin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.idUtilisateur;
    delete updateData.numeroOrdre;

    const medecin = await MedecinProfil.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('idUtilisateur', 'nom prenom email');

    if (!medecin) {
      return res.status(404).json({
        error: 'Profil médecin non trouvé'
      });
    }

    res.json({
      message: 'Profil médecin mis à jour avec succès',
      medecin
    });
  } catch (error) {
    console.error('Erreur mettreAJourMedecin:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du profil médecin',
      details: error.message
    });
  }
};

// Lister tous les médecins
const listerMedecins = async (req, res) => {
  try {
    const { page = 1, limit = 10, specialite } = req.query;

    const query = {};
    if (specialite) {
      query.specialite = { $regex: specialite, $options: 'i' };
    }

    const medecins = await MedecinProfil.find(query)
      .populate('idUtilisateur', 'nom prenom email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await MedecinProfil.countDocuments(query);

    res.json({
      medecins,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Erreur listerMedecins:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des médecins',
      details: error.message
    });
  }
};

// Obtenir l'agenda d'un médecin
const obtenirAgenda = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const medecin = await MedecinProfil.findById(id).populate('idUtilisateur', 'nom prenom');

    if (!medecin) {
      return res.status(404).json({
        error: 'Médecin non trouvé'
      });
    }

    let dateDebut, dateFin;
    
    if (date) {
      dateDebut = new Date(date);
      dateDebut.setHours(0, 0, 0, 0);
      dateFin = new Date(date);
      dateFin.setHours(23, 59, 59, 999);
    } else {
      dateDebut = new Date();
      dateDebut.setHours(0, 0, 0, 0);
      dateFin = new Date();
      dateFin.setDate(dateFin.getDate() + 7);
    }

    const rendezVous = await RendezVous.find({
      idMedecin: id,
      date: { $gte: dateDebut, $lte: dateFin },
      statut: { $ne: 'ANNULE' }
    })
    .populate('idPatient')
    .sort({ date: 1, heure: 1 });

    res.json({
      medecin: {
        id: medecin._id,
        nom: medecin.idUtilisateur.nom,
        prenom: medecin.idUtilisateur.prenom,
        specialite: medecin.specialite
      },
      periode: {
        debut: dateDebut,
        fin: dateFin
      },
      rendezVous,
      total: rendezVous.length
    });
  } catch (error) {
    console.error('Erreur obtenirAgenda:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de l\'agenda',
      details: error.message
    });
  }
};

// Vérifier disponibilité
const verifierDisponibilite = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, heure } = req.query;

    if (!date || !heure) {
      return res.status(400).json({
        error: 'Date et heure sont requises'
      });
    }

    const rdvExistant = await RendezVous.findOne({
      idMedecin: id,
      date: new Date(date),
      heure,
      statut: { $ne: 'ANNULE' }
    });

    res.json({
      disponible: !rdvExistant,
      message: rdvExistant 
        ? 'Créneau occupé' 
        : 'Créneau disponible'
    });
  } catch (error) {
    console.error('Erreur verifierDisponibilite:', error);
    res.status(500).json({
      error: 'Erreur lors de la vérification de disponibilité',
      details: error.message
    });
  }
};

module.exports = {
  creerMedecin,
  lireMedecin,
    mettreAJourMedecin,
    listerMedecins,
    obtenirAgenda,
    verifierDisponibilite
};