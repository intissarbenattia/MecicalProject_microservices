import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import consultationService from '../../services/consultationService';
import medecinService from '../../services/medecinService';
import Card from '../common/Card';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { FiCalendar, FiUsers, FiFileText, FiClock, FiArrowRight, FiActivity } from 'react-icons/fi';

const MedecinDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [medecinProfile, setMedecinProfile] = useState(null);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingConsultations: 0,
    completedToday: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentConsultations, setRecentConsultations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Récupérer le profil médecin pour avoir l'ID
      const medecinsData = await medecinService.list({ limit: 100 });
      const currentMedecin = medecinsData.medecins.find(
        m => m.idUtilisateur._id === user._id
      );

      if (!currentMedecin) {
        setError('Profil médecin non trouvé');
        return;
      }

      setMedecinProfile(currentMedecin);

      // Date du jour
      const today = new Date().toISOString().split('T')[0];

      // Récupérer les RDV du jour
      const rdvData = await appointmentService.list({
        idMedecin: currentMedecin._id,
        dateDebut: today,
        dateFin: today
      });

      const todayRdv = rdvData.rendezVous || [];
      setTodayAppointments(todayRdv);

      // Récupérer les consultations récentes
      const consultationsData = await consultationService.list({
        limit: 5
      });
      setRecentConsultations(consultationsData.consultations || []);

      // Calculer les stats
      const todayCount = todayRdv.filter(r => r.statut === 'PREVU').length;
      const completedCount = todayRdv.filter(r => r.statut === 'REALISE').length;

      // Compter les patients uniques
      const uniquePatients = new Set(todayRdv.map(r => r.idPatient?._id));

      setStats({
        todayAppointments: todayCount,
        totalPatients: uniquePatients.size,
        pendingConsultations: todayCount,
        completedToday: completedCount
      });

    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'PREVU':
        return <span className="badge badge-info">À venir</span>;
      case 'REALISE':
        return <span className="badge badge-success">Terminé</span>;
      case 'ANNULE':
        return <span className="badge badge-danger">Annulé</span>;
      default:
        return <span className="badge">{statut}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Chargement du tableau de bord..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          Bonjour, Dr. {user?.nom}! 👨‍⚕️
        </h1>
        {medecinProfile && (
          <p className="mt-2 text-primary-100">
            {medecinProfile.specialite} • Ordre: {medecinProfile.numeroOrdre}
          </p>
        )}
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">RDV Aujourd'hui</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">
                {stats.todayAppointments}
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
              <p className="text-sm text-green-600 font-medium">Patients du Jour</p>
              <p className="text-3xl font-bold text-green-700 mt-2">
                {stats.totalPatients}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiUsers className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">En Attente</p>
              <p className="text-3xl font-bold text-yellow-700 mt-2">
                {stats.pendingConsultations}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiClock className="text-yellow-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Consultations Faites</p>
              <p className="text-3xl font-bold text-purple-700 mt-2">
                {stats.completedToday}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FiActivity className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Rendez-vous du jour */}
      <Card 
        title="Planning d'aujourd'hui" 
        subtitle={`${todayAppointments.length} rendez-vous`}
        actions={
          <Link to="/medecin/agenda" className="btn-outline text-sm">
            Voir l'agenda complet
          </Link>
        }
      >
        {todayAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p>Aucun rendez-vous aujourd'hui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((rdv) => (
              <div
                key={rdv._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiClock className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {rdv.heure} - {rdv.idPatient?.idUtilisateur?.prenom}{' '}
                      {rdv.idPatient?.idUtilisateur?.nom}
                    </p>
                    <p className="text-sm text-gray-500">
                      {rdv.motif} • {rdv.duree} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(rdv.statut)}
                  {rdv.statut === 'PREVU' && (
                    <Link
                      to={`/medecin/consultation/${rdv._id}`}
                      className="btn-primary text-sm"
                    >
                      Consulter
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Consultations récentes */}
      <Card 
        title="Consultations Récentes" 
        subtitle="Dernières consultations effectuées"
        actions={
          <Link to="/medecin/consultations" className="btn-outline text-sm">
            Voir toutes
          </Link>
        }
      >
        {recentConsultations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p>Aucune consultation récente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentConsultations.slice(0, 5).map((consultation) => (
              <div
                key={consultation._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FiFileText className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {consultation.idPatient?.idUtilisateur?.prenom}{' '}
                      {consultation.idPatient?.idUtilisateur?.nom}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(consultation.date).toLocaleDateString('fr-FR')} •{' '}
                      {consultation.diagnostic}
                    </p>
                  </div>
                </div>
                <Link 
                  to={`/medecin/consultation/${consultation._id}`}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <FiArrowRight size={20} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/medecin/agenda"
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 border-l-4 border-primary-500"
        >
          <div>
            <p className="font-semibold text-gray-900">Mon Agenda</p>
            <p className="text-sm text-gray-500">Voir le planning</p>
          </div>
          <FiArrowRight className="text-primary-600" size={20} />
        </Link>

        <Link
          to="/medecin/consultations"
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 border-l-4 border-green-500"
        >
          <div>
            <p className="font-semibold text-gray-900">Consultations</p>
            <p className="text-sm text-gray-500">Gérer les consultations</p>
          </div>
          <FiArrowRight className="text-green-600" size={20} />
        </Link>

        <Link
          to="/medecin/patients"
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 border-l-4 border-purple-500"
        >
          <div>
            <p className="font-semibold text-gray-900">Mes Patients</p>
            <p className="text-sm text-gray-500">Liste des patients</p>
          </div>
          <FiArrowRight className="text-purple-600" size={20} />
        </Link>
      </div>
    </div>
  );
};

export default MedecinDashboard;