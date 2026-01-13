import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PatientDashboard from '../components/patient/PatientDashboard';
import PatientProfile from '../components/patient/PatientProfile';
import PatientAppointments from '../components/patient/PatientAppointments';
import PatientDocuments from '../components/patient/PatientDocuments';

const PatientDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="/profile" element={<PatientProfile />} />
            <Route path="/appointments" element={<PatientAppointments />} />
            <Route path="/documents" element={<PatientDocuments />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboardPage;