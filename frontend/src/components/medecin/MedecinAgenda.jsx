import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import medecinService from '../../services/medecinService';
import Card from '../common/Card';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { FiCalendar, FiClock, FiUser, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const MedecinAgenda = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [medecinId, setMedecinId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMedecinProfile();
  }, []);

  useEffect(() => {
    if (medecinId) {
      generateWeekDays();
    }
  }, [medecinId, selectedDate]);

  // Charger les rendez-vous quand weekDays est mis à jour
  useEffect(() => {
    if (medecinId && weekDays.length > 0) {
      loadAppointments();
    }
  }, [weekDays, medecinId]);

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

  const generateWeekDays = () => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    setWeekDays(days);
  };

  const loadAppointments = async () => {
    if (weekDays.length === 0) return;

    try {
      setLoading(true);
      
      const startOfWeek = new Date(weekDays[0]);
      const endOfWeek = new Date(weekDays[6]);
      endOfWeek.setHours(23, 59, 59, 999); // Fin de journée
      
      const data = await appointmentService.list({
        idMedecin: medecinId,
        dateDebut: startOfWeek.toISOString().split('T')[0],
        dateFin: endOfWeek.toISOString().split('T')[0]
      });

      setAppointments(data.rendezVous || []);
      setError(''); // Réinitialiser l'erreur en cas de succès
    } catch (err) {
      console.error('Erreur chargement RDV:', err);
      
      // Message d'erreur plus détaillé
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Erreur lors du chargement des rendez-vous';
      setError(errorMessage);
      
      // En cas d'erreur, on garde les rendez-vous existants plutôt que de tout vider
      // setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const changeWeek = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setSelectedDate(newDate);
  };

  const getAppointmentsForDay = (date) => {
    return appointments.filter(rdv => {
      const rdvDate = new Date(rdv.date).toDateString();
      return rdvDate === date.toDateString();
    }).sort((a, b) => a.heure.localeCompare(b.heure));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'PREVU':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'REALISE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ANNULE':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!medecinId && !loading && !error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert type="warning" message="Profil médecin non trouvé. Veuillez créer votre profil." />
      </div>
    );
  }

  if (loading && weekDays.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Chargement de l'agenda..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Mon Agenda</h1>
        <p className="mt-2 text-primary-100">
          Planning hebdomadaire de vos rendez-vous
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {/* Navigation semaine */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeWeek(-1)}
            className="btn-outline flex items-center"
            disabled={loading}
          >
            <FiChevronLeft className="mr-2" size={18} />
            Semaine précédente
          </button>
          
          <div className="text-center">
            {weekDays.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-gray-900">
                  {weekDays[0]?.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </h2>
                <p className="text-sm text-gray-500">
                  Semaine du {weekDays[0]?.toLocaleDateString('fr-FR')} au{' '}
                  {weekDays[6]?.toLocaleDateString('fr-FR')}
                </p>
              </>
            )}
          </div>

          <button
            onClick={() => changeWeek(1)}
            className="btn-outline flex items-center"
            disabled={loading}
          >
            Semaine suivante
            <FiChevronRight className="ml-2" size={18} />
          </button>
        </div>

        {/* Indicateur de chargement */}
        {loading && (
          <div className="text-center py-4">
            <Loader text="Chargement des rendez-vous..." />
          </div>
        )}

        {/* Grille de la semaine */}
        {weekDays.length > 0 && (
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day, index) => {
              const dayAppointments = getAppointmentsForDay(day);
              const today = isToday(day);

              return (
                <div
                  key={index}
                  className={`border rounded-lg p-3 min-h-[200px] ${
                    today ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  {/* En-tête du jour */}
                  <div className={`text-center mb-3 pb-2 border-b ${
                    today ? 'border-primary-300' : 'border-gray-200'
                  }`}>
                    <p className={`text-xs font-medium ${
                      today ? 'text-primary-600' : 'text-gray-500'
                    }`}>
                      {day.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase()}
                    </p>
                    <p className={`text-lg font-bold ${
                      today ? 'text-primary-700' : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </p>
                  </div>

                  {/* Rendez-vous du jour */}
                  <div className="space-y-2">
                    {dayAppointments.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">
                        Aucun RDV
                      </p>
                    ) : (
                      dayAppointments.map((rdv) => (
                        <Link
                          key={rdv._id}
                          to={`/medecin/consultation/${rdv._id}`}
                          className={`block p-2 rounded border text-xs hover:shadow-md transition ${
                            getStatusColor(rdv.statut)
                          }`}
                        >
                          <div className="flex items-center mb-1">
                            <FiClock size={12} className="mr-1" />
                            <span className="font-semibold">{rdv.heure}</span>
                          </div>
                          <p className="font-medium truncate">
                            {rdv.idPatient?.idUtilisateur?.prenom}{' '}
                            {rdv.idPatient?.idUtilisateur?.nom}
                          </p>
                          <p className="text-xs opacity-75 truncate">
                            {rdv.motif}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Légende */}
      <Card title="Légende">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div>
            <span className="text-sm text-gray-700">À venir</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Terminé</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Annulé</span>
          </div>
        </div>
      </Card>

      {/* Statistiques de la semaine */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <div className="text-center">
            <FiCalendar className="mx-auto text-blue-600 mb-2" size={32} />
            <p className="text-2xl font-bold text-blue-700">
              {appointments.filter(r => r.statut === 'PREVU').length}
            </p>
            <p className="text-sm text-blue-600">RDV à venir</p>
          </div>
        </Card>

        <Card className="bg-green-50">
          <div className="text-center">
            <FiClock className="mx-auto text-green-600 mb-2" size={32} />
            <p className="text-2xl font-bold text-green-700">
              {appointments.filter(r => r.statut === 'REALISE').length}
            </p>
            <p className="text-sm text-green-600">Consultations faites</p>
          </div>
        </Card>

        <Card className="bg-purple-50">
          <div className="text-center">
            <FiUser className="mx-auto text-purple-600 mb-2" size={32} />
            <p className="text-2xl font-bold text-purple-700">
              {new Set(appointments.map(r => r.idPatient?._id)).size}
            </p>
            <p className="text-sm text-purple-600">Patients uniques</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MedecinAgenda;