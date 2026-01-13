import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import consultationService from '../../services/consultationService';
import medecinService from '../../services/medecinService';
import patientService from '../../services/patientService';
import Card from '../common/Card';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { FiUsers, FiSearch, FiEye, FiFileText, FiActivity } from 'react-icons/fi';

const MedecinPatients = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [medecinId, setMedecinId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMedecinProfile();
  }, []);

  useEffect(() => {
    if (medecinId) {
      loadPatients();
    }
  }, [medecinId]);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients]);

  const loadMedecinProfile = async () => {
    try {
      const medecinsData = await medecinService.list({ limit: 100 });
      const currentMedecin = medecinsData.medecins.find(
        m => m.idUtilisateur._id === user._id
      );
      if (currentMedecin) {
        setMedecinId(currentMedecin._id);
      }
    } catch (err) {
      console.error('Erreur chargement profil:', err);
    }
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les RDV du médecin
      const rdvData = await appointmentService.list({
        idMedecin: medecinId,
        limit: 1000
      });

      // Extraire les patients uniques
      const uniquePatientsMap = new Map();
      rdvData.rendezVous?.forEach(rdv => {
        if (rdv.idPatient && !uniquePatientsMap.has(rdv.idPatient._id)) {
          uniquePatientsMap.set(rdv.idPatient._id, rdv.idPatient);
        }
      });

      const patientsArray = Array.from(uniquePatientsMap.values());
      setPatients(patientsArray);
      setFilteredPatients(patientsArray);
    } catch (err) {
      console.error('Erreur chargement patients:', err);
      setError('Erreur lors du chargement des patients');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter(patient => {
      const searchLower = searchTerm.toLowerCase();
      return (
        patient.numeroDossier?.toLowerCase().includes(searchLower) ||
        patient.idUtilisateur?.nom?.toLowerCase().includes(searchLower) ||
        patient.idUtilisateur?.prenom?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredPatients(filtered);
  };

  const handleViewDetails = async (patient) => {
    try {
      setLoading(true);
      
      // Charger le profil complet
      const fullPatient = await patientService.getProfile(patient._id);
      setSelectedPatient(fullPatient.patient);

      // Charger l'historique des consultations
      const consultations = await consultationService.getByPatient(patient._id);
      setPatientHistory(consultations.consultations || []);

      setShowDetailsModal(true);
    } catch (err) {
      console.error('Erreur chargement détails:', err);
      setError('Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Chargement des patients..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Mes Patients</h1>
        <p className="mt-2 text-primary-100">
          {filteredPatients.length} patient(s) suivi(s)
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {/* Barre de recherche */}
      <Card>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom ou numéro de dossier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      </Card>

      {/* Liste des patients */}
      <Card>
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiUsers className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium">
              {searchTerm ? 'Aucun patient trouvé' : 'Aucun patient suivi'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                onClick={() => handleViewDetails(patient)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <FiUsers className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {patient.idUtilisateur?.prenom} {patient.idUtilisateur?.nom}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {patient.numeroDossier}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sexe:</span>
                    <span className="font-medium">
                      {patient.sexe === 'M' ? 'Masculin' : 'Féminin'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Groupe sanguin:</span>
                    <span className="font-medium">{patient.groupeSanguin}</span>
                  </div>
                  {patient.allergies && patient.allergies !== 'Aucune' && (
                    <div className="mt-2 pt-2 border-t">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                        ⚠️ Allergies
                      </span>
                    </div>
                  )}
                </div>

                <button
                  className="mt-3 w-full btn-outline text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(patient);
                  }}
                >
                  <FiEye className="inline mr-2" size={14} />
                  Voir le dossier
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal détails patient */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedPatient(null);
          setPatientHistory([]);
        }}
        title="Dossier Médical"
        size="large"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Informations patient */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedPatient.idUtilisateur?.prenom} {selectedPatient.idUtilisateur?.nom}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Dossier: {selectedPatient.numeroDossier}
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {selectedPatient.age} ans
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Date de naissance</p>
                  <p className="font-medium">
                    {new Date(selectedPatient.dateNaissance).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Sexe</p>
                  <p className="font-medium">
                    {selectedPatient.sexe === 'M' ? 'Masculin' : 'Féminin'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Groupe sanguin</p>
                  <p className="font-medium">{selectedPatient.groupeSanguin}</p>
                </div>
                <div>
                  <p className="text-gray-600">Contact</p>
                  <p className="font-medium">{selectedPatient.idUtilisateur?.email}</p>
                </div>
              </div>
            </div>

            {/* Informations médicales */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FiActivity className="mr-2" size={18} />
                Informations Médicales
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Allergies:</p>
                  <p className={`${selectedPatient.allergies !== 'Aucune' ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                    {selectedPatient.allergies}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Antécédents:</p>
                  <p className="text-gray-900">{selectedPatient.antecedents}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Traitements en cours:</p>
                  <p className="text-gray-900">{selectedPatient.traitements}</p>
                </div>
              </div>
            </div>

            {/* Historique des consultations */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FiFileText className="mr-2" size={18} />
                Historique des Consultations ({patientHistory.length})
              </h4>
              
              {patientHistory.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucune consultation enregistrée
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {patientHistory.map((consultation) => (
                    <div key={consultation._id} className="border rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(consultation.date).toLocaleDateString('fr-FR')}
                        </span>
                        {consultation.ordonnance && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Ordonnance
                          </span>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-600">
                          <strong>Diagnostic:</strong> {consultation.diagnostic}
                        </p>
                        <p className="text-gray-600">
                          <strong>Traitement:</strong> {consultation.traitement}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedPatient(null);
                  setPatientHistory([]);
                }}
                className="btn-primary"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedecinPatients;