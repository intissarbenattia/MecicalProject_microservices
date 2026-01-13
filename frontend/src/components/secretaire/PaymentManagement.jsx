import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import consultationService from '../../services/consultationService';
import Card from '../common/Card';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { FiDollarSign, FiPlus, FiTrendingUp, FiCreditCard, FiCalendar, FiPieChart } from 'react-icons/fi';

const PaymentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState({
    statut: '',
    modePaiement: '',
    dateDebut: '',
    dateFin: ''
  });

  const [formData, setFormData] = useState({
    montant: '',
    modePaiement: 'ESPECES',
    statut: 'PAYE',
    idConsultation: ''
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [paymentsData, consultationsData, statsData] = await Promise.all([
        paymentService.list(filters),
        consultationService.list({ limit: 100 }), // Chargera toutes les consultations avec populate
        paymentService.getStatistics(filters)
      ]);

      setPayments(paymentsData.paiements || []);
      
      // Filtrer les consultations qui n'ont pas encore de paiement
      const consultationsSansPaiement = (consultationsData.consultations || []).filter(
        consultation => !paymentsData.paiements?.some(p => p.idConsultation?._id === consultation._id)
      );
      
      setConsultations(consultationsSansPaiement);
      setStatistics(statsData);
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
      montant: '',
      modePaiement: 'ESPECES',
      statut: 'PAYE',
      idConsultation: ''
    });
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await paymentService.create(formData);
      setSuccess('Paiement enregistré avec succès');
      setShowModal(false);
      resetForm();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur création paiement:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement du paiement');
    }
  };

  const formatConsultationLabel = (consultation) => {
    try {
      const patientNom = consultation.idPatient?.idUtilisateur?.nom || 'N/A';
      const patientPrenom = consultation.idPatient?.idUtilisateur?.prenom || '';
      const medecinNom = consultation.idMedecin?.idUtilisateur?.nom || 'N/A';
      
      // Utiliser dateConsultation au lieu de date
      const dateField = consultation.dateConsultation || consultation.date;
      const dateConsultation = dateField ? 
        new Date(dateField).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : 'Date inconnue';
      
      return `Patient: ${patientPrenom} ${patientNom} | Dr. ${medecinNom} | ${dateConsultation}`;
    } catch (error) {
      console.error('Erreur formatage consultation:', error);
      return 'Consultation invalide';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'CARTE':
        return '💳';
      case 'ESPECES':
        return '💵';
      case 'CHEQUE':
        return '📝';
      case 'VIREMENT':
        return '🏦';
      default:
        return '💰';
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'PAYE':
        return <span className="badge badge-success">Payé</span>;
      case 'PARTIEL':
        return <span className="badge badge-warning">Partiel</span>;
      case 'IMPAYE':
        return <span className="badge badge-danger">Impayé</span>;
      default:
        return <span className="badge">{statut}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Chargement des paiements..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Gestion des Paiements</h1>
        <p className="mt-2 text-primary-100">
          {payments.length} paiement(s) enregistré(s)
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}

      {/* Statistiques */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Paiements</p>
                <p className="text-3xl font-bold text-green-700 mt-2">
                  {statistics.totalPaiements}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <FiDollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-blue-50 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Montant Total</p>
                <p className="text-3xl font-bold text-blue-700 mt-2">
                  {statistics.montantTotal.toFixed(2)}€
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiTrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-purple-50 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Payés</p>
                <p className="text-3xl font-bold text-purple-700 mt-2">
                  {statistics.parStatut.find(s => s._id === 'PAYE')?.count || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FiCreditCard className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Impayés</p>
                <p className="text-3xl font-bold text-red-700 mt-2">
                  {statistics.parStatut.find(s => s._id === 'IMPAYE')?.count || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiPieChart className="text-red-600" size={24} />
              </div>
            </div>
          </Card>
        </div>
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
              <option value="PAYE">Payé</option>
              <option value="PARTIEL">Partiel</option>
              <option value="IMPAYE">Impayé</option>
            </select>
          </div>

          <div>
            <label className="form-label">Mode de paiement</label>
            <select
              name="modePaiement"
              value={filters.modePaiement}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">Tous</option>
              <option value="ESPECES">Espèces</option>
              <option value="CARTE">Carte</option>
              <option value="CHEQUE">Chèque</option>
              <option value="VIREMENT">Virement</option>
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

          <div className="flex items-end">
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary w-full"
            >
              <FiPlus className="inline mr-2" size={18} />
              Nouveau Paiement
            </button>
          </div>
        </div>
      </Card>

      {/* Répartition par mode de paiement */}
      {statistics && statistics.parModePaiement.length > 0 && (
        <Card title="Répartition par Mode de Paiement">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statistics.parModePaiement.map((mode) => (
              <div key={mode._id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{getPaymentMethodIcon(mode._id)}</span>
                  <span className="text-sm font-medium text-gray-600">{mode.count}</span>
                </div>
                <p className="text-sm text-gray-600">{mode._id}</p>
                <p className="text-lg font-bold text-gray-900">{mode.montant.toFixed(2)}€</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Liste des paiements */}
      <Card>
        {payments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiDollarSign className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Aucun paiement trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Consultation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiCalendar className="text-gray-400 mr-2" size={16} />
                        <span className="text-sm text-gray-900">
                          {new Date(payment.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.idConsultation?.idPatient?.idUtilisateur?.prenom}{' '}
                        {payment.idConsultation?.idPatient?.idUtilisateur?.nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.idConsultation?.idPatient?.numeroDossier}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-gray-900">
                        {payment.montant.toFixed(2)}€
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {getPaymentMethodIcon(payment.modePaiement)}
                        </span>
                        <span className="text-sm text-gray-900">
                          {payment.modePaiement}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.statut)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {payment.idConsultation?.diagnostic || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Dr. {payment.idConsultation?.idMedecin?.idUtilisateur?.nom}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal création paiement */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Nouveau Paiement"
        size="medium"
      >
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div>
            <label className="form-label">Consultation *</label>
            <select
              name="idConsultation"
              value={formData.idConsultation}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="">Sélectionner une consultation</option>
              {consultations.length === 0 ? (
                <option value="" disabled>Aucune consultation disponible</option>
              ) : (
                consultations.map(consultation => (
                  <option key={consultation._id} value={consultation._id}>
                    {formatConsultationLabel(consultation)}
                  </option>
                ))
              )}
            </select>
            {consultations.length === 0 && (
              <p className="text-sm text-amber-600 mt-1">
                Toutes les consultations ont déjà un paiement associé
              </p>
            )}
          </div>

          <div>
            <label className="form-label">Montant (€) *</label>
            <input
              type="number"
              name="montant"
              value={formData.montant}
              onChange={handleInputChange}
              className="input-field"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="form-label">Mode de paiement *</label>
            <select
              name="modePaiement"
              value={formData.modePaiement}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="ESPECES">Espèces</option>
              <option value="CARTE">Carte bancaire</option>
              <option value="CHEQUE">Chèque</option>
              <option value="VIREMENT">Virement</option>
            </select>
          </div>

          <div>
            <label className="form-label">Statut *</label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="PAYE">Payé</option>
              <option value="PARTIEL">Partiel</option>
              <option value="IMPAYE">Impayé</option>
            </select>
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
            <button 
              type="submit" 
              className="btn-primary"
              disabled={consultations.length === 0}
            >
              <FiDollarSign className="inline mr-2" size={18} />
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentManagement;