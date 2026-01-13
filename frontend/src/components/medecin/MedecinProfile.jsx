import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import medecinService from '../../services/medecinService';
import Card from '../common/Card';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { FiUser, FiLock, FiSave, FiMail, FiPhone, FiBriefcase } from 'react-icons/fi';

const MedecinProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [medecinProfile, setMedecinProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const [profileForm, setProfileForm] = useState({
    nom: '',
    prenom: '',
    email: ''
  });

  const [medecinForm, setMedecinForm] = useState({
    specialite: '',
    tarifConsultation: ''
  });



  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Charger le profil utilisateur
      const userProfile = await authService.getProfile();
      setProfileForm({
        nom: userProfile.utilisateur.nom || '',
        prenom: userProfile.utilisateur.prenom || '',
        email: userProfile.utilisateur.email || ''
      });

      // Charger le profil médecin
      const medecinsData = await medecinService.list({ limit: 100 });
      const currentMedecin = medecinsData.medecins.find(
        m => m.idUtilisateur._id === user._id
      );

      if (currentMedecin) {
        setMedecinProfile(currentMedecin);
        setMedecinForm({
          specialite: currentMedecin.specialite || '',
          tarifConsultation: currentMedecin.tarifConsultation || ''
        });
      }
    } catch (err) {
      console.error('Erreur chargement profil:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updatedUser = await authService.updateProfile(profileForm);
      updateUser(updatedUser.utilisateur);
      setSuccess('Profil mis à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur mise à jour profil:', err);
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleMedecinSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await medecinService.update(medecinProfile._id, medecinForm);
      setSuccess('Informations professionnelles mises à jour');
      loadProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur mise à jour médecin:', err);
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Chargement du profil..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Mon Profil</h1>
        <p className="mt-2 text-primary-100">
          Gérer vos informations personnelles et professionnelles
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiUser className="inline mr-2" size={18} />
              Informations personnelles
            </button>
            <button
              onClick={() => setActiveTab('professionnel')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'professionnel'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiBriefcase className="inline mr-2" size={18} />
              Informations professionnelles
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Onglet Informations personnelles */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">
                    <FiUser className="inline mr-2" size={16} />
                    Nom
                  </label>
                  <input
                    type="text"
                    value={profileForm.nom}
                    onChange={(e) => setProfileForm({...profileForm, nom: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">
                    <FiUser className="inline mr-2" size={16} />
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={profileForm.prenom}
                    onChange={(e) => setProfileForm({...profileForm, prenom: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">
                    <FiMail className="inline mr-2" size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  <FiSave className="inline mr-2" size={18} />
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          )}

          {/* Onglet Informations professionnelles */}
          {activeTab === 'professionnel' && medecinProfile && (
            <form onSubmit={handleMedecinSubmit} className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Numéro d'ordre:</strong> {medecinProfile.numeroOrdre}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Le numéro d'ordre ne peut pas être modifié
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">
                    <FiBriefcase className="inline mr-2" size={16} />
                    Spécialité
                  </label>
                  <input
                    type="text"
                    value={medecinForm.specialite}
                    onChange={(e) => setMedecinForm({...medecinForm, specialite: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Tarif de consultation (€)</label>
                  <input
                    type="number"
                    value={medecinForm.tarifConsultation}
                    onChange={(e) => setMedecinForm({...medecinForm, tarifConsultation: e.target.value})}
                    className="input-field"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  <FiSave className="inline mr-2" size={18} />
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Statistiques du compte */}
      {medecinProfile && (
        <Card title="Informations du compte">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Rôle</p>
              <p className="font-medium text-gray-900">Médecin</p>
            </div>
            <div>
              <p className="text-gray-600">Membre depuis</p>
              <p className="font-medium text-gray-900">
                {new Date(medecinProfile.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Dernière mise à jour</p>
              <p className="font-medium text-gray-900">
                {new Date(medecinProfile.updatedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MedecinProfile;