const Paiement = require('../models/Paiement');
const Consultation = require('../models/Consultation');

// Effectuer un paiement
const effectuerPaiement = async (req, res) => {
  try {
    const { montant, modePaiement, statut, idConsultation } = req.body;

    const consultation = await Consultation.findById(idConsultation);
    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation non trouvée'
      });
    }

    // Vérifier qu'un paiement n'existe pas déjà pour cette consultation
    const paiementExistant = await Paiement.findOne({ idConsultation });
    if (paiementExistant) {
      return res.status(400).json({
        error: 'Un paiement existe déjà pour cette consultation'
      });
    }

    const paiement = new Paiement({
      date: new Date(),
      montant,
      modePaiement,
      statut: statut || 'PAYE',
      idConsultation
    });

    await paiement.save();

    res.status(201).json({
      message: 'Paiement effectué avec succès',
      paiement
    });
  } catch (error) {
    console.error('Erreur effectuerPaiement:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'enregistrement du paiement',
      details: error.message
    });
  }
};

// Lire un paiement
const lirePaiement = async (req, res) => {
  try {
    const { id } = req.params;

    const paiement = await Paiement.findById(id)
      .populate({
        path: 'idConsultation',
        populate: [
          {
            path: 'idPatient',
            populate: { path: 'idUtilisateur' }
          },
          {
            path: 'idMedecin',
            populate: { path: 'idUtilisateur' }
          }
        ]
      });

    if (!paiement) {
      return res.status(404).json({
        error: 'Paiement non trouvé'
      });
    }

    res.json({
      paiement
    });
  } catch (error) {
    console.error('Erreur lirePaiement:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du paiement',
      details: error.message
    });
  }
};

// Mettre à jour un paiement
const mettreAJourPaiement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.idConsultation;

    const paiement = await Paiement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate({
        path: 'idConsultation',
        populate: [
          {
            path: 'idPatient',
            populate: { path: 'idUtilisateur' }
          },
          {
            path: 'idMedecin',
            populate: { path: 'idUtilisateur' }
          }
        ]
      });

    if (!paiement) {
      return res.status(404).json({
        error: 'Paiement non trouvé'
      });
    }

    res.json({
      message: 'Paiement mis à jour avec succès',
      paiement
    });
  } catch (error) {
    console.error('Erreur mettreAJourPaiement:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du paiement',
      details: error.message
    });
  }
};

// Lister les paiements
const listerPaiements = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      statut, 
      modePaiement,
      dateDebut,
      dateFin
    } = req.query;

    const query = {};

    if (statut) query.statut = statut;
    if (modePaiement) query.modePaiement = modePaiement;
    
    if (dateDebut || dateFin) {
      query.date = {};
      if (dateDebut) query.date.$gte = new Date(dateDebut);
      if (dateFin) query.date.$lte = new Date(dateFin);
    }

    const paiements = await Paiement.find(query)
      .populate({
        path: 'idConsultation',
        populate: [
          {
            path: 'idPatient',
            populate: { path: 'idUtilisateur' }
          },
          {
            path: 'idMedecin',
            populate: { path: 'idUtilisateur' }
          }
        ]
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const count = await Paiement.countDocuments(query);

    res.json({
      paiements,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Erreur listerPaiements:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des paiements',
      details: error.message
    });
  }
};

// Statistiques de paiement
const statistiquesPaiements = async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;

    const query = {};
    if (dateDebut || dateFin) {
      query.date = {};
      if (dateDebut) query.date.$gte = new Date(dateDebut);
      if (dateFin) query.date.$lte = new Date(dateFin);
    }

    const totalPaiements = await Paiement.countDocuments(query);
    
    const montantTotal = await Paiement.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$montant' } } }
    ]);

    const parStatut = await Paiement.aggregate([
      { $match: query },
      { $group: { _id: '$statut', count: { $sum: 1 }, montant: { $sum: '$montant' } } }
    ]);

    const parModePaiement = await Paiement.aggregate([
      { $match: query },
      { $group: { _id: '$modePaiement', count: { $sum: 1 }, montant: { $sum: '$montant' } } }
    ]);

    res.json({
      totalPaiements,
      montantTotal: montantTotal[0]?.total || 0,
      parStatut,
      parModePaiement
    });
  } catch (error) {
    console.error('Erreur statistiquesPaiements:', error);
    res.status(500).json({
      error: 'Erreur lors du calcul des statistiques',
      details: error.message
    });
  }
};

module.exports = {
  effectuerPaiement,
  lirePaiement,
  mettreAJourPaiement,
  listerPaiements,
  statistiquesPaiements
};