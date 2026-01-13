import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import authService from '../../services/authService';
import Card from '../common/Card';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { FiUser, FiMail, FiCalendar, FiMapPin, FiHeart, FiActivity } from 'react-icons/fi';

const PatientProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patientProfile, setPatientProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [authData, setAuthData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || ''
  });

  const [profileData, setProfileData] = useState({
    adresse: '',
    allergies: '',
    antecedents: '',
    traitements: '',
    vaccinations: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const patientsData = await patientService.listPatients();
      const myProfile = patientsData.patients.find(
        p => p.idUtilisateur._id === user.id
      );

      if (myProfile) {
        setPatientProfile(myProfile);
        setProfileData({
          adresse: myProfile.adresse || '',
          allergies: myProfile.allergies || '',
          antecedents: myProfile.antecedents || '',
          traitements: myProfile.traitements || '',
          vaccinations: myProfile.vaccinations || ''
        });
      }
    } catch (err) {
      console.error('Erreur chargement profil:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthChange = (e) => {
    setAuthData({
      ...authData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Mettre à jour les informations utilisateur
      const updatedAuth = await authService.updateProfile(authData);
      updateUser(updatedAuth.utilisateur);

      // Mettre à jour le profil patient
      if (patientProfile) {
        await patientService.updateProfile(patientProfile._id, profileData);
      }

      setSuccess('Profil mis à jour avec succès!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur mise à jour:', err);
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Chargement de votre profil..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Mon Profil</h1>
        <p className="mt-2 text-primary-100">
          Gérez vos informations personnelles et médicales
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations personnelles */}
        <Card title="Informations Personnelles" subtitle="Vos données de connexion">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <FiUser className="inline mr-2" />
                Nom
              </label>
              <input
                type="text"
                name="nom"
                value={authData.nom}
                onChange={handleAuthChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">
                <FiUser className="inline mr-2" />
                Prénom
              </label>
              <input
                type="text"
                name="prenom"
                value={authData.prenom}
                onChange={handleAuthChange}
                className="input-field"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">
                <FiMail className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={authData.email}
                onChange={handleAuthChange}
                className="input-field"
                required
              />
            </div>
          </div>
        </Card>

        {/* Informations médicales */}
        {patientProfile && (
          <Card title="Informations Médicales" subtitle="Votre dossier médical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Numéro de dossier</label>
                <input
                  type="text"
                  value={patientProfile.numeroDossier}
                  className="input-field bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label className="label">Date de naissance</label>
                <input
                  type="text"
                  value={new Date(patientProfile.dateNaissance).toLocaleDateString('fr-FR')}
                  className="input-field bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label className="label">Sexe</label>
                <input
                  type="text"
                  value={patientProfile.sexe === 'M' ? 'Masculin' : 'Féminin'}
                  className="input-field bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label className="label">Groupe sanguin</label>
                <input
                  type="text"
                  value={patientProfile.groupeSanguin}
                  className="input-field bg-gray-100"
                  disabled
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">
                  <FiMapPin className="inline mr-2" />
                  Adresse
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={profileData.adresse}
                  onChange={handleProfileChange}
                  className="input-field"
                  placeholder="15 Rue de la Santé, Paris"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">
                  <FiHeart className="inline mr-2" />
                  Allergies
                </label>
                <textarea
                  name="allergies"
                  value={profileData.allergies}
                  onChange={handleProfileChange}
                  className="input-field"
                  rows="3"
                  placeholder="Pénicilline, Pollen, Arachides..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">
                  <FiActivity className="inline mr-2" />
                  Antécédents médicaux
                </label>
                <textarea
                  name="antecedents"
                  value={profileData.antecedents}
                  onChange={handleProfileChange}
                  className="input-field"
                  rows="3"
                  placeholder="Asthme, Diabète, Hypertension..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Traitements en cours</label>
                <textarea
                  name="traitements"
                  value={profileData.traitements}
                  onChange={handleProfileChange}
                  className="input-field"
                  rows="3"
                  placeholder="Ventoline, Metformine..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">
                  <FiCalendar className="inline mr-2" />
                  Vaccinations
                </label>
                <textarea
                  name="vaccinations"
                  value={profileData.vaccinations}
                  onChange={handleProfileChange}
                  className="input-field"
                  rows="2"
                  placeholder="COVID-19, Grippe, Tétanos..."
                />
              </div>
            </div>
          </Card>
        )}

        {/* Boutons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={loadProfile}
            className="btn-outline"
            disabled={saving}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientProfile;