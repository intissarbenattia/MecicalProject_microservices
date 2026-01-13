import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import patientService from '../../services/patientService';
import Card from '../common/Card';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { FiSearch, FiUsers, FiEye, FiEdit, FiTrash2, FiPhone, FiMail, FiCalendar } from 'react-icons/fi';

const PatientList = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients]);

  const loadPatients = async (page = 1) => {
    try {
      setLoading(true);
      const data = await patientService.listPatients({ page, limit: 20 });
      setPatients(data.patients || []);
      setFilteredPatients(data.patients || []);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0
      });
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
        patient.idUtilisateur?.prenom?.toLowerCase().includes(searchLower) ||
        patient.idUtilisateur?.email?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredPatients(filtered);
  };

  const handleViewDetails = async (patient) => {
    try {
      const fullPatient = await patientService.getProfile(patient._id);
      setSelectedPatient(fullPatient.patient);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Erreur chargement détails:', err);
      setError('Erreur lors du chargement des détails');
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce patient? Cette action est irréversible.')) {
      return;
    }

    try {
      await patientService.deletePatient(patientId);
      setSuccess('Patient supprimé avec succès');
      loadPatients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur suppression:', err);
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
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
        <h1 className="text-3xl font-bold">Gestion des Patients</h1>
        <p className="mt-2 text-primary-100">
          {pagination.total} patient(s) enregistré(s)
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}

      {/* Barre de recherche */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom, dossier, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <Link to="/secretaire/new-patient" className="btn-primary whitespace-nowrap">
            <FiUsers className="inline mr-2" size={18} />
            Nouveau Patient
          </Link>
        </div>
      </Card>

      {/* Liste des patients */}
      <Card>
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiUsers className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium">
              {searchTerm ? 'Aucun patient trouvé' : 'Aucun patient enregistré'}
            </p>
            {!searchTerm && (
              <Link to="/secretaire/new-patient" className="btn-primary mt-4 inline-flex items-center">
                <FiUsers className="mr-2" size={18} />
                Créer le premier patient
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dossier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Informations
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <FiUsers className="text-primary-600" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.idUtilisateur?.prenom} {patient.idUtilisateur?.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.sexe === 'M' ? 'Masculin' : 'Féminin'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.numeroDossier}</div>
                        <div className="text-sm text-gray-500">
                          Né(e) le {new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiMail className="mr-2 text-gray-400" size={14} />
                          {patient.idUtilisateur?.email}
                        </div>
                        {patient.adresse && (
                          <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                            {patient.adresse}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {patient.groupeSanguin}
                          </span>
                          {patient.allergies && patient.allergies !== 'Aucune' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">
                              Allergies
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(patient)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                          title="Voir détails"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => loadPatients(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="btn-outline"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => loadPatients(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="btn-outline ml-3"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{pagination.currentPage}</span> sur{' '}
                      <span className="font-medium">{pagination.totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => loadPatients(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="btn-outline rounded-l-md"
                      >
                        Précédent
                      </button>
                      <button
                        onClick={() => loadPatients(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="btn-outline rounded-r-md"
                      >
                        Suivant
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modal détails patient */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Détails du Patient"
        size="large"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Informations personnelles */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Informations Personnelles</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Nom complet</p>
                  <p className="font-medium">{selectedPatient.idUtilisateur?.prenom} {selectedPatient.idUtilisateur?.nom}</p>
                </div>
                <div>
                  <p className="text-gray-500">Numéro de dossier</p>
                  <p className="font-medium">{selectedPatient.numeroDossier}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date de naissance</p>
                  <p className="font-medium">{new Date(selectedPatient.dateNaissance).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Âge</p>
                  <p className="font-medium">{selectedPatient.age} ans</p>
                </div>
                <div>
                  <p className="text-gray-500">Sexe</p>
                  <p className="font-medium">{selectedPatient.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Groupe sanguin</p>
                  <p className="font-medium">{selectedPatient.groupeSanguin}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{selectedPatient.idUtilisateur?.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Adresse</p>
                  <p className="font-medium">{selectedPatient.adresse || 'Non renseignée'}</p>
                </div>
              </div>
            </div>

            {/* Informations médicales */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Informations Médicales</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Allergies:</p>
                  <p className="text-sm text-gray-600">{selectedPatient.allergies}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Antécédents:</p>
                  <p className="text-sm text-gray-600">{selectedPatient.antecedents}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Traitements en cours:</p>
                  <p className="text-sm text-gray-600">{selectedPatient.traitements}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Vaccinations:</p>
                  <p className="text-sm text-gray-600">{selectedPatient.vaccinations}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            {selectedPatient.fichiersUploads && selectedPatient.fichiersUploads.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Documents ({selectedPatient.fichiersUploads.length})</h3>
                <div className="space-y-2">
                  {selectedPatient.fichiersUploads.map((file) => (
                    <div key={file._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.nom}</span>
                      <span className="text-xs text-gray-500">{file.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn-outline"
              >
                Fermer
              </button>
              <Link
                to="/secretaire/appointments"
                className="btn-primary flex items-center"
              >
                <FiCalendar className="mr-2" size={18} />
                Prendre RDV
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientList;