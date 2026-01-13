import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import SidebarMedecin from '../components/common/SidebarMedecin';
import MedecinDashboard from '../components/medecin/MedecinDashboard';
import MedecinAgenda from '../components/medecin/MedecinAgenda';
import MedecinConsultations from '../components/medecin/MedecinConsultations';
import MedecinPatients from '../components/medecin/MedecinPatients';
import MedecinProfile from '../components/medecin/MedecinProfile';

const MedecinDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <SidebarMedecin />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/medecin/dashboard" replace />} />
            <Route path="/dashboard" element={<MedecinDashboard />} />
            <Route path="/agenda" element={<MedecinAgenda />} />
            <Route path="/consultations" element={<MedecinConsultations />} />
            <Route path="/consultation/:rdvId" element={<MedecinConsultations />} />
            <Route path="/patients" element={<MedecinPatients />} />
            <Route path="/profile" element={<MedecinProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default MedecinDashboardPage;