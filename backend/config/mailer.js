const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.MAIL_USER, // Votre email
    pass: process.env.MAIL_PASS  // Votre mot de passe d'application
  }
});

// Fonction pour envoyer un email
const envoyerEmail = async (destinataire, sujet, contenu) => {
  try {
    const info = await transporter.sendMail({
      from: `"Cabinet Médical" <${process.env.MAIL_USER}>`,
      to: destinataire,
      subject: sujet,
      html: contenu
    });

    console.log('Email envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error: error.message };
  }
};

// Template email confirmation RDV
const emailConfirmationRDV = (nomPatient, dateRDV, heureRDV, nomMedecin) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Confirmation de rendez-vous</h2>
      <p>Bonjour ${nomPatient},</p>
      <p>Votre rendez-vous a été confirmé :</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date(dateRDV).toLocaleDateString('fr-FR')}</p>
        <p><strong>Heure:</strong> ${heureRDV}</p>
        <p><strong>Médecin:</strong> Dr. ${nomMedecin}</p>
      </div>
      <p>Merci de votre confiance.</p>
      <p style="color: #7f8c8d; font-size: 12px;">Cabinet Médical</p>
    </div>
  `;
};

// Template email annulation RDV
const emailAnnulationRDV = (nomPatient, dateRDV, heureRDV) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">Annulation de rendez-vous</h2>
      <p>Bonjour ${nomPatient},</p>
      <p>Votre rendez-vous du <strong>${new Date(dateRDV).toLocaleDateString('fr-FR')}</strong> à <strong>${heureRDV}</strong> a été annulé.</p>
      <p>Pour prendre un nouveau rendez-vous, veuillez contacter le cabinet.</p>
      <p style="color: #7f8c8d; font-size: 12px;">Cabinet Médical</p>
    </div>
  `;
};

// Template email rappel RDV
const emailRappelRDV = (nomPatient, dateRDV, heureRDV, nomMedecin) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3498db;">Rappel de rendez-vous</h2>
      <p>Bonjour ${nomPatient},</p>
      <p>Nous vous rappelons votre rendez-vous :</p>
      <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date(dateRDV).toLocaleDateString('fr-FR')}</p>
        <p><strong>Heure:</strong> ${heureRDV}</p>
        <p><strong>Médecin:</strong> Dr. ${nomMedecin}</p>
      </div>
      <p>À bientôt!</p>
      <p style="color: #7f8c8d; font-size: 12px;">Cabinet Médical</p>
    </div>
  `;
};

module.exports = {
  envoyerEmail,
  emailConfirmationRDV,
  emailAnnulationRDV,
  emailRappelRDV
};