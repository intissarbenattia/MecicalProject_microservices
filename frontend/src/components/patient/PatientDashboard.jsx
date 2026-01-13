import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import consultationService from '../../services/consultationService';
import Card from '../common/Card';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { FiCalendar, FiFileText, FiClock, FiArrowRight } from 'react-icons/fi';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patientProfile, setPatientProfile] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentConsultations, setRecentConsultations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Récupérer tous les patients et trouver celui de l'utilisateur connecté
      const patientsData = await patientService.listPatients();
      const myProfile = patientsData.patients.find(
        p => p.idUtilisateur._id === user.id
      );

      if (myProfile) {
        setPatientProfile(myProfile);

        // Récupérer les prochains RDV
        const rdvData = await patientService.getUpcomingAppointments(myProfile._id);
        setUpcomingAppointments(rdvData.prochainsRendezVous || []);

        // Récupérer les consultations récentes
        const consultData = await consultationService.list({
          idPatient: myProfile._id,
          limit: 5
        });
        setRecentConsultations(consultData.consultations || []);
      }
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Chargement de votre tableau de bord..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          Bonjour, {user?.prenom} {user?.nom}! 👋
        </h1>
        <p className="mt-2 text-primary-100">
          Bienvenue sur votre espace patient
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Prochains RDV</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">
                {upcomingAppointments.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiCalendar className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Consultations</p>
              <p className="text-3xl font-bold text-green-700 mt-2">
                {recentConsultations.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiClock className="text-green-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Informations du profil */}
      {patientProfile && (
        <Card 
          title="Informations Personnelles" 
          subtitle="Vos informations médicales"
          actions={
            <Link to="/patient/profile" className="btn-outline text-sm">
              Modifier
            </Link>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Numéro de dossier</p>
              <p className="font-semibold text-gray-900">{patientProfile.numeroDossier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de naissance</p>
              <p className="font-semibold text-gray-900">
                {new Date(patientProfile.dateNaissance).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Groupe sanguin</p>
              <p className="font-semibold text-gray-900">{patientProfile.groupeSanguin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Allergies</p>
              <p className="font-semibold text-gray-900">{patientProfile.allergies}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Prochains rendez-vous */}
      <Card 
        title="Prochains Rendez-vous" 
        subtitle={`${upcomingAppointments.length} rendez-vous à venir`}
        actions={
          <Link to="/patient/appointments" className="btn-outline text-sm">
            Voir tous
          </Link>
        }
      >
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p>Aucun rendez-vous à venir</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.slice(0, 3).map((rdv) => (
              <div
                key={rdv._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiCalendar className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{rdv.motif}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(rdv.date).toLocaleDateString('fr-FR')} à {rdv.heure}
                    </p>
                  </div>
                </div>
                <span className="badge badge-info">{rdv.statut}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Consultations récentes */}
      <Card 
        title="Consultations Récentes" 
        subtitle="Historique de vos consultations"
        actions={
          <Link to="/patient/consultations" className="btn-outline text-sm">
            Voir toutes
          </Link>
        }
      >
        {recentConsultations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p>Aucune consultation enregistrée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentConsultations.slice(0, 3).map((consultation) => (
              <div
                key={consultation._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FiFileText className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{consultation.motif}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(consultation.dateConsultation).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <span className="badge badge-success">{consultation.type}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/patient/appointments"
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 border-l-4 border-primary-500"
        >
          <div>
            <p className="font-semibold text-gray-900">Mes Rendez-vous</p>
            <p className="text-sm text-gray-500">Gérer vos RDV</p>
          </div>
          <FiArrowRight className="text-primary-600" size={20} />
        </Link>

        <Link
          to="/patient/documents"
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 border-l-4 border-green-500"
        >
          <div>
            <p className="font-semibold text-gray-900">Mes Documents</p>
            <p className="text-sm text-gray-500">Ordonnances, certificats</p>
          </div>
          <FiArrowRight className="text-green-600" size={20} />
        </Link>

        <Link
          to="/patient/profile"
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 border-l-4 border-purple-500"
        >
          <div>
            <p className="font-semibold text-gray-900">Mon Profil</p>
            <p className="text-sm text-gray-500">Modifier mes infos</p>
          </div>
          <FiArrowRight className="text-purple-600" size={20} />
        </Link>
      </div>
    </div>
  );
};

export default PatientDashboard;