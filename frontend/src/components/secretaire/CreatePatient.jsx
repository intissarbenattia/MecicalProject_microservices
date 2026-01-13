import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import patientService from '../../services/patientService';
import Card from '../common/Card';
import Alert from '../common/Alert';
import { FiUser, FiMail, FiLock, FiCalendar, FiMapPin, FiHeart, FiActivity } from 'react-icons/fi';

const CreatePatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);

  const [userData, setUserData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mdp: '',
    role: 'PATIENT'
  });

  const [patientData, setPatientData] = useState({
    dateNaissance: '',
    sexe: 'M',
    adresse: '',
    allergies: '',
    antecedents: '',
    groupeSanguin: '',
    traitements: '',
    vaccinations: ''
  });

  const handleUserChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handlePatientChange = (e) => {
    setPatientData({
      ...patientData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    
    if (!userData.nom || !userData.prenom || !userData.email) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setError('Adresse email invalide');
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userResponse = await authService.register(userData);
      
      await patientService.createProfile({
        idUtilisateur: userResponse.utilisateur.id,
        ...patientData
      });

      setSuccess('Patient créé avec succès! Redirection...');
      
      setTimeout(() => {
        navigate('/secretaire/patients');
      }, 2000);
    } catch (err) {
      console.error('Erreur création patient:', err);
      setError(err.response?.data?.error || 'Erreur lors de la création du patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Nouveau Patient</h1>
        <p className="mt-2 text-primary-100">
          Créer un dossier patient complet
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {success && (
        <Alert type="success" message={success} />
      )}

      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 1 ? 'border-primary-600 bg-primary-50' : 'border-gray-300'}`}>
              <span className="font-semibold">1</span>
            </div>
            <span className="ml-2 font-medium">Informations personnelles</span>
          </div>
          <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 2 ? 'border-primary-600 bg-primary-50' : 'border-gray-300'}`}>
              <span className="font-semibold">2</span>
            </div>
            <span className="ml-2 font-medium">Informations médicales</span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1Submit}>
          <Card title="Informations Personnelles" subtitle="Compte utilisateur du patient">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <FiUser className="inline mr-2" />
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={userData.nom}
                  onChange={handleUserChange}
                  className="input-field"
                  placeholder="Dupont"
                  required
                />
              </div>

              <div>
                <label className="label">
                  <FiUser className="inline mr-2" />
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={userData.prenom}
                  onChange={handleUserChange}
                  className="input-field"
                  placeholder="Jean"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">
                  <FiMail className="inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleUserChange}
                  className="input-field"
                  placeholder="jean.dupont@email.com"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">
                  <FiLock className="inline mr-2" />
                  Mot de passe
                </label>
                <input
                  type="text"
                  name="mdp"
                  value={userData.mdp}
                  onChange={handleUserChange}
                  className="input-field"
                  placeholder="Mot de passe par défaut"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Le patient pourra le modifier après sa première connexion
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => navigate('/secretaire/patients')}
                className="btn-outline"
              >
                Annuler
              </button>
              <button type="submit" className="btn-primary">
                Suivant
              </button>
            </div>
          </Card>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2Submit}>
          <Card title="Informations Médicales" subtitle="Dossier médical du patient">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  <FiCalendar className="inline mr-2" />
                  Date de naissance *
                </label>
                <input
                  type="date"
                  name="dateNaissance"
                  value={patientData.dateNaissance}
                  onChange={handlePatientChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Sexe *</label>
                <select
                  name="sexe"
                  value={patientData.sexe}
                  onChange={handlePatientChange}
                  className="input-field"
                  required
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="label">Groupe sanguin</label>
                <select
                  name="groupeSanguin"
                  value={patientData.groupeSanguin}
                  onChange={handlePatientChange}
                  className="input-field"
                >
                  <option value="Inconnu">Inconnu</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <FiMapPin className="inline mr-2" />
                  Adresse
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={patientData.adresse}
                  onChange={handlePatientChange}
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
                  value={patientData.allergies}
                  onChange={handlePatientChange}
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
                  value={patientData.antecedents}
                  onChange={handlePatientChange}
                  className="input-field"
                  rows="3"
                  placeholder="Asthme, Diabète, Hypertension..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Traitements en cours</label>
                <textarea
                  name="traitements"
                  value={patientData.traitements}
                  onChange={handlePatientChange}
                  className="input-field"
                  rows="2"
                  placeholder="Ventoline, Metformine..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Vaccinations</label>
                <textarea
                  name="vaccinations"
                  value={patientData.vaccinations}
                  onChange={handlePatientChange}
                  className="input-field"
                  rows="2"
                  placeholder="COVID-19, Grippe, Tétanos..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-outline"
                disabled={loading}
              >
                Retour
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Création...' : 'Créer le patient'}
              </button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
};

export default CreatePatient;