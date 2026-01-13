import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import appointmentService from '../../services/appointmentService';
import Card from '../common/Card';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { FiCalendar, FiClock, FiUser, FiX, FiAlertCircle } from 'react-icons/fi';

const PatientAppointments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [, setPatientProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // Trouver le profil patient
      const patientsData = await patientService.listPatients();
      const myProfile = patientsData.patients.find(
        p => p.idUtilisateur._id === user.id
      );

      if (myProfile) {
        setPatientProfile(myProfile);

        // Récupérer tous les RDV du patient
        const rdvData = await appointmentService.list({
          idPatient: myProfile._id
        });
        setAppointments(rdvData.rendezVous || []);
      }
    } catch (err) {
      console.error('Erreur chargement RDV:', err);
      setError('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (rdv) => {
    setSelectedRdv(rdv);
    setShowCancelModal(true);
    setCancelReason('');
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      setError('Veuillez indiquer une raison d\'annulation');
      return;
    }

    setCancelling(true);
    setError('');

    try {
      await appointmentService.cancel(selectedRdv._id, cancelReason);
      setSuccess('Rendez-vous annulé avec succès. Un email de confirmation a été envoyé.');
      setShowCancelModal(false);
      loadAppointments(); // Recharger la liste
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Erreur annulation:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'annulation du rendez-vous');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'PREVU':
        return <span className="badge badge-info">Prévu</span>;
      case 'REALISE':
        return <span className="badge badge-success">Réalisé</span>;
      case 'ANNULE':
        return <span className="badge badge-danger">Annulé</span>;
      default:
        return <span className="badge">{statut}</span>;
    }
  };

  const isPastAppointment = (date, heure) => {
    const rdvDate = new Date(`${date}T${heure}`);
    return rdvDate < new Date();
  };

  const upcomingAppointments = appointments.filter(
    rdv => !isPastAppointment(rdv.date, rdv.heure) && rdv.statut === 'PREVU'
  );

  const pastAppointments = appointments.filter(
    rdv => isPastAppointment(rdv.date, rdv.heure) || rdv.statut !== 'PREVU'
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Chargement de vos rendez-vous..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Mes Rendez-vous</h1>
        <p className="mt-2 text-primary-100">
          Consultez et gérez vos rendez-vous
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}

      {/* Rendez-vous à venir */}
      <Card 
        title="Prochains Rendez-vous" 
        subtitle={`${upcomingAppointments.length} rendez-vous à venir`}
      >
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiCalendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Aucun rendez-vous à venir</p>
            <p className="text-sm mt-2">Contactez le cabinet pour prendre rendez-vous</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((rdv) => (
              <div
                key={rdv._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiCalendar className="text-primary-600" size={18} />
                      <span className="font-semibold text-gray-900">
                        {new Date(rdv.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <FiClock className="text-gray-500" size={18} />
                      <span className="text-gray-700">{rdv.heure}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{rdv.duree} minutes</span>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <FiUser className="text-gray-500" size={18} />
                      <span className="text-gray-700">
                        Dr. {rdv.idMedecin?.idUtilisateur?.prenom} {rdv.idMedecin?.idUtilisateur?.nom}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Motif:</span> {rdv.motif}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 ml-4">
                    {getStatusBadge(rdv.statut)}
                    {rdv.statut === 'PREVU' && (
                      <button
                        onClick={() => handleCancelClick(rdv)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                      >
                        <FiX className="mr-1" size={16} />
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Historique */}
      <Card 
        title="Historique" 
        subtitle={`${pastAppointments.length} rendez-vous passés`}
      >
        {pastAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun historique de rendez-vous</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastAppointments.map((rdv) => (
              <div
                key={rdv._id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-700">
                        {new Date(rdv.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{rdv.heure}</span>
                    </div>
                    <p className="text-sm text-gray-600">{rdv.motif}</p>
                    {rdv.raisonAnnulation && (
                      <p className="text-sm text-red-600 mt-2">
                        <FiAlertCircle className="inline mr-1" size={14} />
                        {rdv.raisonAnnulation}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(rdv.statut)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal d'annulation */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Annuler le rendez-vous"
        size="medium"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <FiAlertCircle className="text-yellow-400 mt-0.5" size={20} />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Vous êtes sur le point d'annuler votre rendez-vous. Un email de confirmation sera envoyé.
                </p>
              </div>
            </div>
          </div>

          {selectedRdv && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Date:</span> {new Date(selectedRdv.date).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Heure:</span> {selectedRdv.heure}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Motif:</span> {selectedRdv.motif}
              </p>
            </div>
          )}

          <div>
            <label className="label">
              Raison de l'annulation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="input-field"
              rows="4"
              placeholder="Ex: Empêchement personnel, Problème de santé résolu..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowCancelModal(false)}
              className="btn-outline"
              disabled={cancelling}
            >
              Fermer
            </button>
            <button
              onClick={handleCancelConfirm}
              className="btn-danger"
              disabled={cancelling || !cancelReason.trim()}
            >
              {cancelling ? 'Annulation...' : 'Confirmer l\'annulation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientAppointments;