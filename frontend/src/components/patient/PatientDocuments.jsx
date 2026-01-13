import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import consultationService from '../../services/consultationService';
import Card from '../common/Card';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { FiFileText, FiDownload, FiEye, FiCalendar, FiUser } from 'react-icons/fi';

const PatientDocuments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [, setPatientProfile] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      // Trouver le profil patient
      const patientsData = await patientService.listPatients();
      const myProfile = patientsData.patients.find(
        p => p.idUtilisateur._id === user.id
      );

      if (myProfile) {
        setPatientProfile(myProfile);
        setDocuments(myProfile.fichiersUploads || []);

        // Récupérer les consultations avec ordonnances et certificats
        const consultData = await consultationService.list({
          idPatient: myProfile._id
        });
        
        // Pour chaque consultation, récupérer les détails complets
        const consultationsWithDocs = await Promise.all(
          (consultData.consultations || []).map(async (consult) => {
            try {
              const fullConsult = await consultationService.getById(consult._id);
              return fullConsult;
            } catch (err) {
              console.error('Erreur chargement consultation:', err);
              return consult;
            }
          })
        );

        setConsultations(consultationsWithDocs);
      }
    } catch (err) {
      console.error('Erreur chargement documents:', err);
      setError('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (doc) => {
    setSelectedDoc(doc);
    setShowDocModal(true);
  };

  

  

  

  const getDocumentIcon = () => {
    return <FiFileText className="text-primary-600" size={24} />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Chargement de vos documents..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Mes Documents</h1>
        <p className="mt-2 text-primary-100">
          Ordonnances, certificats et documents médicaux
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Ordonnances</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">
                {consultations.reduce((acc, c) => acc + (c.ordonnances?.length || 0), 0)}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiFileText className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Certificats</p>
              <p className="text-3xl font-bold text-green-700 mt-2">
                {consultations.reduce((acc, c) => acc + (c.certificats?.length || 0), 0)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiFileText className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

      </div>

      {/* Ordonnances */}
      <Card 
        title="Ordonnances" 
        subtitle="Vos prescriptions médicales"
      >
        {consultations.filter(c => c.ordonnances?.length > 0).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiFileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Aucune ordonnance</p>
            <p className="text-sm mt-2">Vos ordonnances apparaîtront ici après vos consultations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation) => 
              consultation.ordonnances?.map((ordonnance) => (
                <div
                  key={ordonnance._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getDocumentIcon('ordonnance')}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Ordonnance</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center">
                            <FiCalendar className="mr-2" size={14} />
                            {new Date(ordonnance.date).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="flex items-center">
                            <FiUser className="mr-2" size={14} />
                            Dr. {consultation.consultation?.idMedecin?.idUtilisateur?.prenom} {consultation.consultation?.idMedecin?.idUtilisateur?.nom}
                          </p>
                        </div>
                        <div className="mt-3 bg-gray-50 rounded p-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Médicaments:</p>
                          <p className="text-sm text-gray-600">{ordonnance.medicaments}</p>
                          <p className="text-sm font-medium text-gray-700 mt-2 mb-1">Posologie:</p>
                          <p className="text-sm text-gray-600">{ordonnance.posologie}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      {ordonnance.pdfUrl && (
                        <a
                          href={`http://localhost:3000${ordonnance.pdfUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline text-sm flex items-center"
                        >
                          <FiDownload className="mr-1" size={16} />
                          Télécharger PDF
                        </a>
                      )}
                      <button
                        onClick={() => handleViewDocument({
                          type: 'ordonnance',
                          data: ordonnance,
                          consultation: consultation.consultation
                        })}
                        className="btn-outline text-sm flex items-center"
                      >
                        <FiEye className="mr-1" size={16} />
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* Certificats */}
      <Card 
        title="Certificats Médicaux" 
        subtitle="Vos certificats et attestations"
      >
        {consultations.filter(c => c.certificats?.length > 0).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiFileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Aucun certificat</p>
            <p className="text-sm mt-2">Vos certificats médicaux apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation) => 
              consultation.certificats?.map((certificat) => (
                <div
                  key={certificat._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getDocumentIcon('certificat')}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{certificat.type}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center">
                            <FiCalendar className="mr-2" size={14} />
                            {new Date(certificat.date).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="flex items-center">
                            <FiUser className="mr-2" size={14} />
                            Dr. {consultation.consultation?.idMedecin?.idUtilisateur?.prenom} {consultation.consultation?.idMedecin?.idUtilisateur?.nom}
                          </p>
                        </div>
                        <div className="mt-3 bg-gray-50 rounded p-3">
                          <p className="text-sm text-gray-700">{certificat.contenu}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      {certificat.pdfUrl && (
                        <a
                          href={`http://localhost:3000${certificat.pdfUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline text-sm flex items-center"
                        >
                          <FiDownload className="mr-1" size={16} />
                          Télécharger PDF
                        </a>
                      )}
                      <button
                        onClick={() => handleViewDocument({
                          type: 'certificat',
                          data: certificat,
                          consultation: consultation.consultation
                        })}
                        className="btn-outline text-sm flex items-center"
                      >
                        <FiEye className="mr-1" size={16} />
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>


      {/* Modal de détails du document */}
      <Modal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        title={selectedDoc?.type === 'ordonnance' ? 'Détails de l\'ordonnance' : 'Détails du certificat'}
        size="large"
      >
        {selectedDoc && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Informations</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{new Date(selectedDoc.data.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Médecin</p>
                  <p className="font-medium">
                    Dr. {selectedDoc.consultation?.idMedecin?.idUtilisateur?.prenom} {selectedDoc.consultation?.idMedecin?.idUtilisateur?.nom}
                  </p>
                </div>
              </div>
            </div>

            {selectedDoc.type === 'ordonnance' ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Prescription</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Médicaments:</p>
                    <p className="text-sm text-gray-600">{selectedDoc.data.medicaments}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Posologie:</p>
                    <p className="text-sm text-gray-600">{selectedDoc.data.posologie}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">{selectedDoc.data.type}</h3>
                <p className="text-sm text-gray-700">{selectedDoc.data.contenu}</p>
              </div>
            )}

            {selectedDoc.data.pdfUrl && (
              <div className="flex justify-end pt-4">
                <a
                  href={`http://localhost:3000${selectedDoc.data.pdfUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center"
                >
                  <FiDownload className="mr-2" size={18} />
                  Télécharger le PDF
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      
    </div>
  );
};

export default PatientDocuments;