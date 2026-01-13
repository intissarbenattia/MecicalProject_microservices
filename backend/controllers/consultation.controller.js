const Consultation = require('../models/Consultation');
const Ordonnance = require('../models/Ordonnance');
const Certificat = require('../models/Certificat');
const RendezVous = require('../models/RendezVous');
const PatientProfil = require('../models/PatientProfil');
const MedecinProfil = require('../models/MedecinProfil');
const { genererOrdonnancePDF, genererCertificatPDF } = require('../utils/pdfGenerator');

// Créer une consultation
const creerConsultation = async (req, res) => {
  try {
    const {
      dateConsultation,
      type,
      motif,
      diagnostic,
      observations,
      poids,
      taille,
      pressionArterielle,
      montant,
      idPatient,
      idMedecin,
      idRendezVous
    } = req.body;

    // Vérifier que le patient existe
    const patient = await PatientProfil.findById(idPatient);
    if (!patient) {
      return res.status(404).json({
        error: 'Patient non trouvé'
      });
    }

    // Vérifier que le médecin existe
    const medecin = await MedecinProfil.findById(idMedecin);
    if (!medecin) {
      return res.status(404).json({
        error: 'Médecin non trouvé'
      });
    }

    // Si un RDV est lié, le marquer comme REALISE
    if (idRendezVous) {
      await RendezVous.findByIdAndUpdate(idRendezVous, { statut: 'REALISE' });
    }

    const consultation = new Consultation({
      dateConsultation: dateConsultation || new Date(),
      type,
      motif,
      diagnostic,
      observations,
      poids,
      taille,
      pressionArterielle,
      montant,
      idPatient,
      idMedecin,
      idRendezVous
    });

    await consultation.save();

    await consultation.populate([
      {
        path: 'idPatient',
        populate: { path: 'idUtilisateur' }
      },
      {
        path: 'idMedecin',
        populate: { path: 'idUtilisateur' }
      }
    ]);

    res.status(201).json({
      message: 'Consultation créée avec succès',
      consultation
    });
  } catch (error) {
    console.error('Erreur creerConsultation:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la consultation',
      details: error.message
    });
  }
};

// Lire une consultation
const lireConsultation = async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findById(id)
      .populate({
        path: 'idPatient',
        populate: { path: 'idUtilisateur' }
      })
      .populate({
        path: 'idMedecin',
        populate: { path: 'idUtilisateur' }
      })
      .populate('idRendezVous');

    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation non trouvée'
      });
    }

    // Récupérer les ordonnances et certificats associés
    const ordonnances = await Ordonnance.find({ idConsultation: id });
    const certificats = await Certificat.find({ idConsultation: id });

    res.json({
      consultation,
      ordonnances,
      certificats
    });
  } catch (error) {
    console.error('Erreur lireConsultation:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la consultation',
      details: error.message
    });
  }
};

// Mettre à jour une consultation
const mettreAJourConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.idPatient;
    delete updateData.idMedecin;

    const consultation = await Consultation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate({
        path: 'idPatient',
        populate: { path: 'idUtilisateur' }
      })
      .populate({
        path: 'idMedecin',
        populate: { path: 'idUtilisateur' }
      });

    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation non trouvée'
      });
    }

    res.json({
      message: 'Consultation mise à jour avec succès',
      consultation
    });
  } catch (error) {
    console.error('Erreur mettreAJourConsultation:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de la consultation',
      details: error.message
    });
  }
};

// Lister les consultations
const listerConsultations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      idPatient, 
      idMedecin, 
      type,
      dateDebut,
      dateFin
    } = req.query;

    const query = {};

    if (idPatient) query.idPatient = idPatient;
    if (idMedecin) query.idMedecin = idMedecin;
    if (type) query.type = type;
    
    if (dateDebut || dateFin) {
      query.dateConsultation = {};
      if (dateDebut) query.dateConsultation.$gte = new Date(dateDebut);
      if (dateFin) query.dateConsultation.$lte = new Date(dateFin);
    }

    const consultations = await Consultation.find(query)
      .populate({
        path: 'idPatient',
        populate: { path: 'idUtilisateur' }
      })
      .populate({
        path: 'idMedecin',
        populate: { path: 'idUtilisateur' }
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ dateConsultation: -1 });

    const count = await Consultation.countDocuments(query);

    res.json({
      consultations,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Erreur listerConsultations:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des consultations',
      details: error.message
    });
  }
};

// Créer une ordonnance
const creerOrdonnance = async (req, res) => {
  try {
    const { medicaments, posologie, idConsultation } = req.body;

    const consultation = await Consultation.findById(idConsultation);
    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation non trouvée'
      });
    }

    const ordonnance = new Ordonnance({
      date: new Date(),
      medicaments,
      posologie,
      idConsultation,
      idMedecin: consultation.idMedecin
    });

    await ordonnance.save();

    // Générer le PDF automatiquement
    try {
      const medecin = await MedecinProfil.findById(consultation.idMedecin).populate('idUtilisateur');
      const patient = await PatientProfil.findById(consultation.idPatient).populate('idUtilisateur');
      
      const pdfInfo = await genererOrdonnancePDF(ordonnance, medecin, patient);
      ordonnance.pdfUrl = pdfInfo.url;
      await ordonnance.save();
    } catch (pdfError) {
      console.error('Erreur génération PDF:', pdfError);
    }

    res.status(201).json({
      message: 'Ordonnance créée avec succès',
      ordonnance
    });
  } catch (error) {
    console.error('Erreur creerOrdonnance:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de l\'ordonnance',
      details: error.message
    });
  }
};

// Lire une ordonnance
const lireOrdonnance = async (req, res) => {
  try {
    const { id } = req.params;

    const ordonnance = await Ordonnance.findById(id)
      .populate('idConsultation')
      .populate('idMedecin');

    if (!ordonnance) {
      return res.status(404).json({
        error: 'Ordonnance non trouvée'
      });
    }

    res.json({
      ordonnance
    });
  } catch (error) {
    console.error('Erreur lireOrdonnance:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de l\'ordonnance',
      details: error.message
    });
  }
};

// Mettre à jour une ordonnance
const mettreAJourOrdonnance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.idConsultation;
    delete updateData.idMedecin;

    const ordonnance = await Ordonnance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!ordonnance) {
      return res.status(404).json({
        error: 'Ordonnance non trouvée'
      });
    }

    res.json({
      message: 'Ordonnance mise à jour avec succès',
      ordonnance
    });
  } catch (error) {
    console.error('Erreur mettreAJourOrdonnance:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de l\'ordonnance',
      details: error.message
    });
  }
};

// Créer un certificat
const creerCertificat = async (req, res) => {
  try {
    const { type, contenu, idConsultation } = req.body;

    const consultation = await Consultation.findById(idConsultation);
    if (!consultation) {
      return res.status(404).json({
        error: 'Consultation non trouvée'
      });
    }

    const certificat = new Certificat({
      date: new Date(),
      type,
      contenu,
      idConsultation,
      idMedecin: consultation.idMedecin
    });

    await certificat.save();

    // Générer le PDF automatiquement
    try {
      const medecin = await MedecinProfil.findById(consultation.idMedecin).populate('idUtilisateur');
      const patient = await PatientProfil.findById(consultation.idPatient).populate('idUtilisateur');
      
      const pdfInfo = await genererCertificatPDF(certificat, medecin, patient);
      certificat.pdfUrl = pdfInfo.url;
      await certificat.save();
    } catch (pdfError) {
      console.error('Erreur génération PDF:', pdfError);
    }

    res.status(201).json({
      message: 'Certificat créé avec succès',
      certificat
    });
  } catch (error) {
    console.error('Erreur creerCertificat:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du certificat',
      details: error.message
    });
  }
};

// Lire un certificat
const lireCertificat = async (req, res) => {
  try {
    const { id } = req.params;

    const certificat = await Certificat.findById(id)
      .populate('idConsultation')
      .populate('idMedecin');

    if (!certificat) {
      return res.status(404).json({
        error: 'Certificat non trouvé'
      });
    }

    res.json({
      certificat
    });
  } catch (error) {
    console.error('Erreur lireCertificat:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du certificat',
      details: error.message
    });
  }
};

// Mettre à jour un certificat
const mettreAJourCertificat = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.idConsultation;
    delete updateData.idMedecin;

    const certificat = await Certificat.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!certificat) {
      return res.status(404).json({
        error: 'Certificat non trouvé'
      });
    }

    res.json({
      message: 'Certificat mis à jour avec succès',
      certificat
    });
  } catch (error) {
    console.error('Erreur mettreAJourCertificat:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du certificat',
      details: error.message
    });
  }
};

module.exports = {
  creerConsultation,
  lireConsultation,
  mettreAJourConsultation,
  listerConsultations,
  creerOrdonnance,
  lireOrdonnance,
  mettreAJourOrdonnance,
  creerCertificat,
  lireCertificat,
  mettreAJourCertificat
};