import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import SidebarSecretaire from '../components/common/SidebarSecretaire';
import SecretaireDashboard from '../components/secretaire/SecretaireDashboard';
import PatientList from '../components/secretaire/PatientList';
import CreatePatient from '../components/secretaire/CreatePatient';
import AppointmentManagement from '../components/secretaire/AppointmentManagement';
import PaymentManagement from '../components/secretaire/PaymentManagement';

const SecretaireDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="flex">
        <SidebarSecretaire />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/secretaire/dashboard" replace />} />
            <Route path="/dashboard" element={<SecretaireDashboard />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/new-patient" element={<CreatePatient />} />
            <Route path="/appointments" element={<AppointmentManagement />} />
            <Route path="/payments" element={<PaymentManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default SecretaireDashboardPage;