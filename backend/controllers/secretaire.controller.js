const SecretaireProfil = require('../models/SecretaireProfil');

// Créer un profil secrétaire
const creerSecretaire = async (req, res) => {
  try {
    const { idUtilisateur, dateEmbauche, fonction } = req.body;

    // Vérifier si un profil secrétaire existe déjà
    const secretaireExistant = await SecretaireProfil.findOne({});
    if (secretaireExistant) {
      return res.status(400).json({
        error: 'Un profil secrétaire existe déjà. Vous ne pouvez avoir qu\'une seule secrétaire.'
      });
    }

    const secretaire = new SecretaireProfil({
      idUtilisateur,
      dateEmbauche: dateEmbauche || new Date(),
      fonction: fonction || 'Secrétaire médicale'
    });

    await secretaire.save();

    res.status(201).json({
      message: 'Profil secrétaire créé avec succès',
      secretaire
    });
  } catch (error) {
    console.error('Erreur creerSecretaire:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du profil secrétaire',
      details: error.message
    });
  }
};

// Lire le profil secrétaire
const lireSecretaire = async (req, res) => {
  try {
    const secretaire = await SecretaireProfil.findOne({}).populate('idUtilisateur', 'nom prenom email');

    if (!secretaire) {
      return res.status(404).json({
        error: 'Aucun profil secrétaire trouvé'
      });
    }

    res.json({
      secretaire
    });
  } catch (error) {
    console.error('Erreur lireSecretaire:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du profil secrétaire',
      details: error.message
    });
  }
};

// Mettre à jour le profil secrétaire
const mettreAJourSecretaire = async (req, res) => {
  try {
    const updateData = req.body;
    delete updateData.idUtilisateur;

    const secretaire = await SecretaireProfil.findOneAndUpdate(
      {},
      updateData,
      { new: true, runValidators: true }
    ).populate('idUtilisateur', 'nom prenom email');

    if (!secretaire) {
      return res.status(404).json({
        error: 'Profil secrétaire non trouvé'
      });
    }

    res.json({
      message: 'Profil secrétaire mis à jour avec succès',
      secretaire
    });
  } catch (error) {
    console.error('Erreur mettreAJourSecretaire:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du profil secrétaire',
      details: error.message
    });
  }
};

module.exports = {
  creerSecretaire,
  lireSecretaire,
  mettreAJourSecretaire
};