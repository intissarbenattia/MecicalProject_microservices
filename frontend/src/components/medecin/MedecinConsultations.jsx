import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import consultationService from '../../services/consultationService';
import medecinService from '../../services/medecinService';
import Card from '../common/Card';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { FiFileText, FiPlus, FiSave, FiX, FiDownload, FiPrinter } from 'react-icons/fi';

const MedecinConsultations = () => {
  const { user } = useAuth();
  const { rdvId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [medecinId, setMedecinId] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showOrdonnanceModal, setShowOrdonnanceModal] = useState(false);
  const [showCertificatModal, setShowCertificatModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    dateDebut: '',
    dateFin: ''
  });

  const [consultationForm, setConsultationForm] = useState({
    type: 'NORMALE',
    motif: '',
    diagnostic: '',
    observations: '',
    poids: '',
    taille: '',
    pressionArterielle: '',
    montant: ''
  });

  const [ordonnanceForm, setOrdonnanceForm] = useState({
    medicaments: '',
    posologie: ''
  });

  const [certificatForm, setCertificatForm] = useState({
    type: 'ARRET_TRAVAIL',
    contenu: ''
  });

  useEffect(() => {
    loadMedecinProfile();
  }, []);

  useEffect(() => {
    if (medecinId) {
      loadConsultations();
    }
  }, [medecinId, filters]);

  useEffect(() => {
    if (rdvId && medecinId) {
      loadAppointmentForConsultation();
    }
  }, [rdvId, medecinId]);

  const loadMedecinProfile = async () => {
    try {
      const medecinsData = await medecinService.list({ limit: 100 });
      const currentMedecin = medecinsData.medecins.find(
        m => m.idUtilisateur._id === user._id
      );
      if (currentMedecin) {
        setMedecinId(currentMedecin._id);
      } else {
        setError('Profil médecin non trouvé');
        setLoading(false);
      }
    } catch (err) {
      console.error('Erreur chargement profil:', err);
      setError('Erreur lors du chargement du profil');
      setLoading(false);
    }
  };

  const loadAppointmentForConsultation = async () => {
    try {
      const rdv = await appointmentService.getById(rdvId);
      setSelectedAppointment(rdv.rendezVous);
      // Pré-remplir le motif depuis le RDV
      setConsultationForm(prev => ({
        ...prev,
        motif: rdv.rendezVous.motif || ''
      }));
      setShowConsultationModal(true);
    } catch (err) {
      console.error('Erreur chargement RDV:', err);
      setError('Erreur lors du chargement du rendez-vous');
    }
  };

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const params = { idMedecin: medecinId };
      
      if (filters.dateDebut) params.dateDebut = filters.dateDebut;
      if (filters.dateFin) params.dateFin = filters.dateFin;
      
      const data = await consultationService.list(params);
      setConsultations(data.consultations || []);
      setError('');
    } catch (err) {
      console.error('Erreur chargement consultations:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          'Erreur lors du chargement des consultations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultationChange = (e) => {
    const { name, value } = e.target;
    setConsultationForm({
      ...consultationForm,
      [name]: value
    });
  };

  const handleCreateConsultation = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validation des champs requis
      if (!consultationForm.motif.trim()) {
        setError('Le motif est requis');
        return;
      }
      if (!consultationForm.diagnostic.trim()) {
        setError('Le diagnostic est requis');
        return;
      }
      if (!consultationForm.montant || parseFloat(consultationForm.montant) <= 0) {
        setError('Le montant est requis et doit être supérieur à 0');
        return;
      }

      const consultationData = {
        dateConsultation: new Date().toISOString(),
        type: consultationForm.type,
        motif: consultationForm.motif,
        diagnostic: consultationForm.diagnostic,
        observations: consultationForm.observations,
        poids: consultationForm.poids ? parseFloat(consultationForm.poids) : undefined,
        taille: consultationForm.taille ? parseFloat(consultationForm.taille) : undefined,
        pressionArterielle: consultationForm.pressionArterielle,
        montant: parseFloat(consultationForm.montant),
        idPatient: selectedAppointment.idPatient._id,
        idMedecin: medecinId,
        idRendezVous: selectedAppointment._id
      };

      // Retirer les champs undefined
      Object.keys(consultationData).forEach(key => 
        consultationData[key] === undefined && delete consultationData[key]
      );

      await consultationService.create(consultationData);
      
      setSuccess('Consultation enregistrée avec succès');
      setShowConsultationModal(false);
      resetConsultationForm();
      loadConsultations();
      
      setTimeout(() => {
        navigate('/medecin/consultations');
      }, 1500);
    } catch (err) {
      console.error('Erreur création consultation:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message ||
                          err.response?.data?.details ||
                          'Erreur lors de la création de la consultation';
      setError(errorMessage);
    }
  };

  const resetConsultationForm = () => {
    setConsultationForm({
      type: 'NORMALE',
      motif: '',
      diagnostic: '',
      observations: '',
      poids: '',
      taille: '',
      pressionArterielle: '',
      montant: ''
    });
  };

  const handleCreateOrdonnance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!ordonnanceForm.medicaments.trim() || !ordonnanceForm.posologie.trim()) {
        setError('Les médicaments et la posologie sont requis');
        return;
      }

      const ordonnanceData = {
        medicaments: ordonnanceForm.medicaments,
        posologie: ordonnanceForm.posologie,
        idConsultation: selectedConsultation._id
      };

      await consultationService.createOrdonnance(selectedConsultation._id, ordonnanceData);
      setSuccess('Ordonnance créée avec succès');
      setShowOrdonnanceModal(false);
      setOrdonnanceForm({ medicaments: '', posologie: '' });
      loadConsultations();
    } catch (err) {
      console.error('Erreur création ordonnance:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message ||
                          'Erreur lors de la création de l\'ordonnance';
      setError(errorMessage);
    }
  };

  const handleCreateCertificat = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!certificatForm.type.trim() || !certificatForm.contenu.trim()) {
        setError('Le type et le contenu sont requis');
        return;
      }

      const certificatData = {
        type: certificatForm.type,
        contenu: certificatForm.contenu,
        idConsultation: selectedConsultation._id
      };

      await consultationService.createCertificat(selectedConsultation._id, certificatData);
      setSuccess('Certificat créé avec succès');
      setShowCertificatModal(false);
      setCertificatForm({ type: 'ARRET_TRAVAIL', contenu: '' });
      loadConsultations();
    } catch (err) {
      console.error('Erreur création certificat:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message ||
                          'Erreur lors de la création du certificat';
      setError(errorMessage);
    }
  };

  if (loading && consultations.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Chargement des consultations..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Mes Consultations</h1>
        <p className="mt-2 text-primary-100">
          {consultations.length} consultation(s)
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}

      {/* Filtres */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Date début</label>
            <input
              type="date"
              value={filters.dateDebut}
              onChange={(e) => setFilters({...filters, dateDebut: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="form-label">Date fin</label>
            <input
              type="date"
              value={filters.dateFin}
              onChange={(e) => setFilters({...filters, dateFin: e.target.value})}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ dateDebut: '', dateFin: '' })}
              className="btn-outline w-full"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </Card>

      {/* Liste des consultations */}
      <Card>
        {consultations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiFileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Aucune consultation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation) => (
              <div key={consultation._id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {consultation.idPatient?.idUtilisateur?.prenom}{' '}
                      {consultation.idPatient?.idUtilisateur?.nom}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(consultation.dateConsultation).toLocaleDateString('fr-FR')} •{' '}
                      Type: {consultation.type} •{' '}
                      Dossier: {consultation.idPatient?.numeroDossier}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedConsultation(consultation);
                        setShowOrdonnanceModal(true);
                      }}
                      className="btn-primary text-sm"
                    >
                      <FiPlus className="inline mr-1" size={14} />
                      Ordonnance
                    </button>
                    <button
                      onClick={() => {
                        setSelectedConsultation(consultation);
                        setShowCertificatModal(true);
                      }}
                      className="btn-outline text-sm"
                    >
                      <FiFileText className="inline mr-1" size={14} />
                      Certificat
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Motif:</p>
                    <p className="text-gray-900">{consultation.motif}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Diagnostic:</p>
                    <p className="text-gray-900">{consultation.diagnostic}</p>
                  </div>
                  {consultation.observations && (
                    <div className="col-span-2">
                      <p className="text-gray-600 font-medium">Observations:</p>
                      <p className="text-gray-900">{consultation.observations}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600 font-medium">Montant:</p>
                    <p className="text-gray-900 font-semibold">{consultation.montant} TND</p>
                  </div>
                </div>

                {(consultation.pressionArterielle || consultation.poids || consultation.taille) && (
                  <div className="mt-3 pt-3 border-t flex space-x-4 text-sm">
                    {consultation.pressionArterielle && (
                      <span className="text-gray-600">
                        TA: <strong>{consultation.pressionArterielle}</strong>
                      </span>
                    )}
                    {consultation.poids && (
                      <span className="text-gray-600">
                        Poids: <strong>{consultation.poids} kg</strong>
                      </span>
                    )}
                    {consultation.taille && (
                      <span className="text-gray-600">
                        Taille: <strong>{consultation.taille} cm</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal création consultation */}
      <Modal
        isOpen={showConsultationModal}
        onClose={() => {
          setShowConsultationModal(false);
          resetConsultationForm();
        }}
        title="Nouvelle Consultation"
        size="large"
      >
        {selectedAppointment && (
          <>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium">
                Patient: {selectedAppointment.idPatient?.idUtilisateur?.prenom}{' '}
                {selectedAppointment.idPatient?.idUtilisateur?.nom}
              </p>
              <p className="text-sm text-gray-600">
                RDV: {new Date(selectedAppointment.date).toLocaleDateString('fr-FR')} à {selectedAppointment.heure}
              </p>
            </div>

            <form onSubmit={handleCreateConsultation} className="space-y-4">
              <div>
                <label className="form-label">Type de consultation *</label>
                <select
                  name="type"
                  value={consultationForm.type}
                  onChange={handleConsultationChange}
                  className="input-field"
                  required
                >
                  <option value="NORMALE">Normale</option>
                  <option value="CONTROLE">Contrôle</option>
                  <option value="URGENCE">Urgence</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Pression Artérielle</label>
                  <input
                    type="text"
                    name="pressionArterielle"
                    value={consultationForm.pressionArterielle}
                    onChange={handleConsultationChange}
                    className="input-field"
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <label className="form-label">Poids (kg)</label>
                  <input
                    type="number"
                    name="poids"
                    value={consultationForm.poids}
                    onChange={handleConsultationChange}
                    className="input-field"
                    step="0.1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="form-label">Taille (cm)</label>
                  <input
                    type="number"
                    name="taille"
                    value={consultationForm.taille}
                    onChange={handleConsultationChange}
                    className="input-field"
                    step="0.1"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Motif *</label>
                <textarea
                  name="motif"
                  value={consultationForm.motif}
                  onChange={handleConsultationChange}
                  className="input-field"
                  rows={2}
                  required
                  placeholder="Motif de la consultation..."
                />
              </div>

              <div>
                <label className="form-label">Diagnostic *</label>
                <textarea
                  name="diagnostic"
                  value={consultationForm.diagnostic}
                  onChange={handleConsultationChange}
                  className="input-field"
                  rows={3}
                  required
                  placeholder="Diagnostic médical..."
                />
              </div>

              <div>
                <label className="form-label">Observations</label>
                <textarea
                  name="observations"
                  value={consultationForm.observations}
                  onChange={handleConsultationChange}
                  className="input-field"
                  rows={3}
                  placeholder="Observations complémentaires..."
                />
              </div>

              <div>
                <label className="form-label">Montant (TND) *</label>
                <input
                  type="number"
                  name="montant"
                  value={consultationForm.montant}
                  onChange={handleConsultationChange}
                  className="input-field"
                  step="0.01"
                  min="0"
                  required
                  placeholder="50.00"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowConsultationModal(false);
                    resetConsultationForm();
                  }}
                  className="btn-outline"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  <FiSave className="inline mr-2" size={18} />
                  Enregistrer
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>

      {/* Modal ordonnance */}
      <Modal
        isOpen={showOrdonnanceModal}
        onClose={() => {
          setShowOrdonnanceModal(false);
          setOrdonnanceForm({ medicaments: '', posologie: '' });
        }}
        title="Créer une Ordonnance"
      >
        {selectedConsultation && (
          <>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium">
                Patient: {selectedConsultation.idPatient?.idUtilisateur?.prenom}{' '}
                {selectedConsultation.idPatient?.idUtilisateur?.nom}
              </p>
              <p className="text-sm text-gray-600">
                Consultation du {new Date(selectedConsultation.dateConsultation).toLocaleDateString('fr-FR')}
              </p>
            </div>

            <form onSubmit={handleCreateOrdonnance} className="space-y-4">
              <div>
                <label className="form-label">Médicaments *</label>
                <textarea
                  value={ordonnanceForm.medicaments}
                  onChange={(e) => setOrdonnanceForm({...ordonnanceForm, medicaments: e.target.value})}
                  className="input-field"
                  rows={4}
                  required
                  placeholder="Liste des médicaments prescrits..."
                />
              </div>

              <div>
                <label className="form-label">Posologie *</label>
                <textarea
                  value={ordonnanceForm.posologie}
                  onChange={(e) => setOrdonnanceForm({...ordonnanceForm, posologie: e.target.value})}
                  className="input-field"
                  rows={3}
                  required
                  placeholder="Instructions de prise (dosage, fréquence, durée)..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowOrdonnanceModal(false);
                    setOrdonnanceForm({ medicaments: '', posologie: '' });
                  }}
                  className="btn-outline"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  <FiSave className="inline mr-2" size={18} />
                  Créer l'ordonnance
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>

      {/* Modal certificat */}
      <Modal
        isOpen={showCertificatModal}
        onClose={() => {
          setShowCertificatModal(false);
          setCertificatForm({ type: 'ARRET_TRAVAIL', contenu: '' });
        }}
        title="Créer un Certificat"
      >
        {selectedConsultation && (
          <>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium">
                Patient: {selectedConsultation.idPatient?.idUtilisateur?.prenom}{' '}
                {selectedConsultation.idPatient?.idUtilisateur?.nom}
              </p>
              <p className="text-sm text-gray-600">
                Consultation du {new Date(selectedConsultation.dateConsultation).toLocaleDateString('fr-FR')}
              </p>
            </div>

            <form onSubmit={handleCreateCertificat} className="space-y-4">
              <div>
                <label className="form-label">Type de certificat *</label>
                <select
                  value={certificatForm.type}
                  onChange={(e) => setCertificatForm({...certificatForm, type: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="ARRET_TRAVAIL">Arrêt de travail</option>
                  <option value="SPORT">Certificat médical sport</option>
                  <option value="SCOLARITE">Certificat de scolarité</option>
                  <option value="APTITUDE">Certificat d'aptitude</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>

              <div>
                <label className="form-label">Contenu *</label>
                <textarea
                  value={certificatForm.contenu}
                  onChange={(e) => setCertificatForm({...certificatForm, contenu: e.target.value})}
                  className="input-field"
                  rows={6}
                  required
                  placeholder="Contenu détaillé du certificat..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCertificatModal(false);
                    setCertificatForm({ type: 'ARRET_TRAVAIL', contenu: '' });
                  }}
                  className="btn-outline"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  <FiSave className="inline mr-2" size={18} />
                  Créer le certificat
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default MedecinConsultations;