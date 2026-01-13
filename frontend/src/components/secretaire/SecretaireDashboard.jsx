import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import appointmentService from '../../services/appointmentService';
import paymentService from '../../services/paymentService';
import Card from '../common/Card';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { FiUsers, FiCalendar, FiDollarSign, FiClock, FiArrowRight, FiAlertCircle } from 'react-icons/fi';

const SecretaireDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingPayments: 0,
    todayRevenue: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Récupérer les patients
      const patientsData = await patientService.listPatients({ limit: 100 });
      setStats(prev => ({ ...prev, totalPatients: patientsData.total || 0 }));
      setRecentPatients(patientsData.patients.slice(0, 5));

      // Récupérer les RDV du jour
      const today = new Date().toISOString().split('T')[0];
      const rdvData = await appointmentService.list({
        dateDebut: today,
        dateFin: today
      });
      setTodayAppointments(rdvData.rendezVous || []);
      setStats(prev => ({ 
        ...prev, 
        todayAppointments: rdvData.rendezVous?.filter(r => r.statut === 'PREVU').length || 0
      }));

      // Récupérer les paiements du jour
      const paymentsData = await paymentService.list({
        dateDebut: today,
        dateFin: today
      });
      
      const todayRevenue = paymentsData.paiements?.reduce((sum, p) => {
        return p.statut === 'PAYE' ? sum + p.montant : sum;
      }, 0) || 0;

      const pending = paymentsData.paiements?.filter(p => p.statut === 'IMPAYE').length || 0;

      setStats(prev => ({
        ...prev,
        todayRevenue,
        pendingPayments: pending
      }));

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
        return <span className="badge badge-info">Prévu</span>;
      case 'REALISE':
        return <span className="badge badge-success">Réalisé</span>;
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
          Bonjour, {user?.prenom}! 👋
        </h1>
        <p className="mt-2 text-primary-100">
          Tableau de bord secrétaire
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Patients</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">
                {stats.totalPatients}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUsers className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">RDV Aujourd'hui</p>
              <p className="text-3xl font-bold text-green-700 mt-2">
                {stats.todayAppointments}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiCalendar className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Paiements en attente</p>
              <p className="text-3xl font-bold text-yellow-700 mt-2">
                {stats.pendingPayments}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiAlertCircle className="text-yellow-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Recettes du jour</p>
              <p className="text-3xl font-bold text-purple-700 mt-2">
                {stats.todayRevenue}€
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FiDollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Rendez-vous du jour */}
      <Card 
        title="Rendez-vous d'aujourd'hui" 
        subtitle={`${todayAppointments.length} rendez-vous`}
        actions={
          <Link to="/secretaire/appointments" className="btn-outline text-sm">
            Voir tous
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
                      {rdv.idPatient?.idUtilisateur?.prenom} {rdv.idPatient?.idUtilisateur?.nom}
                    </p>
                    <p className="text-sm text-gray-500">
                      {rdv.heure} • {rdv.motif}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(rdv.statut)}
                  <span className="text-sm text-gray-500">
                    Dr. {rdv.idMedecin?.idUtilisateur?.nom}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Patients récents */}
      <Card 
        title="Patients Récents" 
        subtitle="Derniers patients enregistrés"
        actions={
          <Link to="/secretaire/patients" className="btn-outline text-sm">
            Voir tous
          </Link>
        }
      >
        {recentPatients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p>Aucun patient enregistré</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPatients.map((patient) => (
              <div
                key={patient._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiUsers className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {patient.idUtilisateur?.prenom} {patient.idUtilisateur?.nom}
                    </p>
                    <p className="text-sm text-gray-500">
                      Dossier: {patient.numeroDossier} • {patient.groupeSanguin}
                    </p>
                  </div>
                </div>
                <Link 
                  to={`/secretaire/patients`}
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
          to="/secretaire/new-patient"
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 border-l-4 border-primary-500"
        >
          <div>
            <p className="font-semibold text-gray-900">Nouveau Patient</p>
            <p className="text-sm text-gray-500">Créer un dossier</p>
          </div>
          <FiArrowRight className="text-primary-600" size={20} />
        </Link>

        <Link
          to="/secretaire/appointments"
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 border-l-4 border-green-500"
        >
          <div>
            <p className="font-semibold text-gray-900">Rendez-vous</p>
            <p className="text-sm text-gray-500">Gérer les RDV</p>
          </div>
          <FiArrowRight className="text-green-600" size={20} />
        </Link>

        <Link
          to="/secretaire/payments"
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 border-l-4 border-purple-500"
        >
          <div>
            <p className="font-semibold text-gray-900">Paiements</p>
            <p className="text-sm text-gray-500">Enregistrer un paiement</p>
          </div>
          <FiArrowRight className="text-purple-600" size={20} />
        </Link>
      </div>
    </div>
  );
};

export default SecretaireDashboard;