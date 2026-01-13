const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Créer le dossier pour les PDFs s'il n'existe pas
const pdfDir = path.join(__dirname, '../pdfs');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

/**
 * Générer une ordonnance en PDF
 */
exports.genererOrdonnancePDF = async (ordonnance, medecin, patient) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `ordonnance_${ordonnance._id}.pdf`;
      const filePath = path.join(pdfDir, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // En-tête
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('ORDONNANCE MÉDICALE', { align: 'center' })
         .moveDown();

      // Informations médecin
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Médecin prescripteur:', 50, 150);
      
      doc.font('Helvetica')
         .text(`Dr. ${medecin.idUtilisateur.prenom} ${medecin.idUtilisateur.nom}`, 50, 170)
         .text(`Spécialité: ${medecin.specialite}`, 50, 185)
         .text(`N° Ordre: ${medecin.numeroOrdre}`, 50, 200)
         .text(`Email: ${medecin.idUtilisateur.email}`, 50, 215)
         .moveDown(2);

      // Informations patient
      doc.font('Helvetica-Bold')
         .text('Patient:', 50, 250);
      
      doc.font('Helvetica')
         .text(`${patient.idUtilisateur.prenom} ${patient.idUtilisateur.nom}`, 50, 270)
         .text(`Dossier N°: ${patient.numeroDossier}`, 50, 285)
         .text(`Date de naissance: ${new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}`, 50, 300)
         .moveDown(2);

      // Date de l'ordonnance
      doc.font('Helvetica')
         .text(`Date: ${new Date(ordonnance.date).toLocaleDateString('fr-FR')}`, 400, 250)
         .moveDown(2);

      // Ligne de séparation
      doc.moveTo(50, 340)
         .lineTo(550, 340)
         .stroke();

      // Prescription
      doc.moveDown()
         .font('Helvetica-Bold')
         .fontSize(14)
         .text('PRESCRIPTION', 50, 360)
         .moveDown();

      doc.font('Helvetica')
         .fontSize(12)
         .text(ordonnance.medicaments, 50, 390, { width: 500 })
         .moveDown();

      doc.font('Helvetica-Bold')
         .text('Posologie:', 50, doc.y)
         .moveDown(0.5);

      doc.font('Helvetica')
         .text(ordonnance.posologie, 50, doc.y, { width: 500 })
         .moveDown(3);

      // Signature
      doc.font('Helvetica-Oblique') // Utiliser Helvetica-Oblique au lieu de Helvetica-Italic
         .fontSize(10)
         .text('Signature et cachet du médecin', 350, 650)
         .moveDown(3);

      doc.font('Helvetica')
         .fontSize(8)
         .text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 50, 750, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve({
          fileName,
          filePath,
          url: `/pdfs/${fileName}`
        });
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Générer un certificat médical en PDF
 */
exports.genererCertificatPDF = async (certificat, medecin, patient) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `certificat_${certificat._id}.pdf`;
      const filePath = path.join(pdfDir, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // En-tête
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('CERTIFICAT MÉDICAL', { align: 'center' })
         .moveDown();

      doc.fontSize(14)
         .font('Helvetica')
         .text(certificat.type.toUpperCase(), { align: 'center' })
         .moveDown(2);

      // Informations médecin
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Dr. ${medecin.idUtilisateur.prenom} ${medecin.idUtilisateur.nom}`, 50, 150)
         .text(`${medecin.specialite}`, 50, 165)
         .text(`N° Ordre: ${medecin.numeroOrdre}`, 50, 180)
         .moveDown(2);

      // Date
      doc.text(`Fait le ${new Date(certificat.date).toLocaleDateString('fr-FR')}`, 400, 150)
         .moveDown(3);

      // Contenu du certificat
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .text('Je soussigné,', 50, 250)
         .moveDown();

      doc.font('Helvetica')
         .text(`Dr. ${medecin.idUtilisateur.prenom} ${medecin.idUtilisateur.nom}, ${medecin.specialite}`, 50, doc.y)
         .moveDown();

      doc.text('Certifie avoir examiné ce jour:', 50, doc.y)
         .moveDown();

      doc.font('Helvetica-Bold')
         .text(`${patient.idUtilisateur.prenom} ${patient.idUtilisateur.nom}`, 50, doc.y)
         .font('Helvetica')
         .text(`Né(e) le ${new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}`, 50, doc.y + 15)
         .text(`Dossier N°: ${patient.numeroDossier}`, 50, doc.y + 15)
         .moveDown(2);

      // Ligne de séparation
      doc.moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .stroke()
         .moveDown();

      // Contenu
      doc.fontSize(12)
         .text(certificat.contenu, 50, doc.y, { 
           width: 500, 
           align: 'justify' 
         })
         .moveDown(2);

      // Ligne de séparation
      doc.moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .stroke()
         .moveDown(3);

      // Signature
      doc.font('Helvetica-Oblique') // Utiliser Helvetica-Oblique au lieu de Helvetica-Italic
         .fontSize(10)
         .text('Signature et cachet du médecin', 350, 650);

      doc.font('Helvetica')
         .fontSize(8)
         .text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 50, 750, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve({
          fileName,
          filePath,
          url: `/pdfs/${fileName}`
        });
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};