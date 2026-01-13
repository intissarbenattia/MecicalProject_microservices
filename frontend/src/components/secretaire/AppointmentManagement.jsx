import React, { useState, useEffect } from 'react';
import appointmentService from '../../services/appointmentService';
import patientService from '../../services/patientService';
import medecinService from '../../services/medecinService';
import Card from '../common/Card';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { FiCalendar, FiPlus, FiEdit, FiX, FiCheck, FiClock, FiUser, FiSearch } from 'react-icons/fi';

const AppointmentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    statut: '',
    dateDebut: '',
    dateFin: '',
    idMedecin: '',
    idPatient: ''
  });

  const [formData, setFormData] = useState({
    date: '',
    heure: '',
    motif: '',
    duree: 30,
    idPatient: '',
    idMedecin: ''
  });

  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    heure: ''
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [rdvData, patientsData, medecinsData] = await Promise.all([
        appointmentService.list(filters),
        patientService.listPatients({ limit: 100 }),
        medecinService.list({ limit: 100 })
      ]);

      setAppointments(rdvData.rendezVous || []);
      setPatients(patientsData.patients || []);
      setMedecins(medecinsData.medecins || []);
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      date: '',
      heure: '',
      motif: '',
      duree: 30,
      idPatient: '',
      idMedecin: ''
    });
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await appointmentService.create(formData);
      setSuccess('Rendez-vous créé avec succès');
      setShowModal(false);
      resetForm();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur création RDV:', err);
      setError(err.response?.data?.error || 'Erreur lors de la création du rendez-vous');
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous?')) {
      return;
    }

    const raison = prompt('Raison de l\'annulation (optionnelle):');

    try {
      await appointmentService.cancel(id, raison);
      setSuccess('Rendez-vous annulé avec succès');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur annulation:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'annulation');
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await appointmentService.reschedule(selectedAppointment._id, rescheduleData);
      setSuccess('Rendez-vous reprogrammé avec succès');
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur reprogrammation:', err);
      setError(err.response?.data?.error || 'Erreur lors de la reprogrammation');
    }
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleData({
      date: appointment.date.split('T')[0],
      heure: appointment.heure
    });
    setShowRescheduleModal(true);
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
        <Loader text="Chargement des rendez-vous..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Gestion des Rendez-vous</h1>
        <p className="mt-2 text-primary-100">
          {appointments.length} rendez-vous
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}

      {/* Filtres et actions */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="form-label">Statut</label>
            <select
              name="statut"
              value={filters.statut}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">Tous</option>
              <option value="PREVU">Prévu</option>
              <option value="REALISE">Réalisé</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>

          <div>
            <label className="form-label">Date début</label>
            <input
              type="date"
              name="dateDebut"
              value={filters.dateDebut}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">Date fin</label>
            <input
              type="date"
              name="dateFin"
              value={filters.dateFin}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">Médecin</label>
            <select
              name="idMedecin"
              value={filters.idMedecin}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">Tous</option>
              {medecins.map(medecin => (
                <option key={medecin._id} value={medecin._id}>
                  Dr. {medecin.idUtilisateur?.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary w-full"
            >
              <FiPlus className="inline mr-2" size={18} />
              Nouveau RDV
            </button>
          </div>
        </div>
      </Card>

      {/* Liste des rendez-vous */}
      <Card>
        {appointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiCalendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Aucun rendez-vous trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date & Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Médecin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Motif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((rdv) => (
                  <tr key={rdv._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiCalendar className="text-gray-400 mr-2" size={16} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(rdv.date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-sm text-gray-500">{rdv.heure}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {rdv.idPatient?.idUtilisateur?.prenom} {rdv.idPatient?.idUtilisateur?.nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        {rdv.idPatient?.numeroDossier}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        Dr. {rdv.idMedecin?.idUtilisateur?.nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        {rdv.idMedecin?.specialite}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{rdv.motif}</div>
                      <div className="text-sm text-gray-500">{rdv.duree} min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(rdv.statut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {rdv.statut === 'PREVU' && (
                        <>
                          <button
                            onClick={() => openRescheduleModal(rdv)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="Reprogrammer"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(rdv._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Annuler"
                          >
                            <FiX size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal création RDV */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Nouveau Rendez-vous"
        size="large"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Patient *</label>
              <select
                name="idPatient"
                value={formData.idPatient}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Sélectionner un patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.idUtilisateur?.prenom} {patient.idUtilisateur?.nom} - {patient.numeroDossier}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Médecin *</label>
              <select
                name="idMedecin"
                value={formData.idMedecin}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Sélectionner un médecin</option>
                {medecins.map(medecin => (
                  <option key={medecin._id} value={medecin._id}>
                    Dr. {medecin.idUtilisateur?.nom} - {medecin.specialite}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="input-field"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="form-label">Heure *</label>
              <input
                type="time"
                name="heure"
                value={formData.heure}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="form-label">Durée (minutes) *</label>
              <input
                type="number"
                name="duree"
                value={formData.duree}
                onChange={handleInputChange}
                className="input-field"
                required
                min={15}
                max={180}
                step={15}
              />
            </div>

            <div>
              <label className="form-label">Motif *</label>
              <input
                type="text"
                name="motif"
                value={formData.motif}
                onChange={handleInputChange}
                className="input-field"
                required
                placeholder="Consultation, suivi..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="btn-outline"
            >
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              <FiCheck className="inline mr-2" size={18} />
              Créer le RDV
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal reprogrammation */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setSelectedAppointment(null);
        }}
        title="Reprogrammer le Rendez-vous"
      >
        <form onSubmit={handleReschedule} className="space-y-4">
          {selectedAppointment && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600">Patient:</p>
              <p className="font-medium">
                {selectedAppointment.idPatient?.idUtilisateur?.prenom} {selectedAppointment.idPatient?.idUtilisateur?.nom}
              </p>
              <p className="text-sm text-gray-600 mt-2">Médecin:</p>
              <p className="font-medium">
                Dr. {selectedAppointment.idMedecin?.idUtilisateur?.nom}
              </p>
            </div>
          )}

          <div>
            <label className="form-label">Nouvelle date *</label>
            <input
              type="date"
              value={rescheduleData.date}
              onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
              className="input-field"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="form-label">Nouvelle heure *</label>
            <input
              type="time"
              value={rescheduleData.heure}
              onChange={(e) => setRescheduleData({...rescheduleData, heure: e.target.value})}
              className="input-field"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowRescheduleModal(false);
                setSelectedAppointment(null);
              }}
              className="btn-outline"
            >
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              <FiCheck className="inline mr-2" size={18} />
              Reprogrammer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AppointmentManagement;