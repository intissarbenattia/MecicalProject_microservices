import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiCalendar, FiFileText, FiUsers, FiUser } from 'react-icons/fi';

const SidebarMedecin = () => {
  const menuItems = [
    {
      name: 'Tableau de bord',
      path: '/medecin/dashboard',
      icon: FiHome
    },
    {
      name: 'Mon Agenda',
      path: '/medecin/agenda',
      icon: FiCalendar
    },
    {
      name: 'Consultations',
      path: '/medecin/consultations',
      icon: FiFileText
    },
    {
      name: 'Mes Patients',
      path: '/medecin/patients',
      icon: FiUsers
    },
    {
      name: 'Mon Profil',
      path: '/medecin/profile',
      icon: FiUser
    }
  ];

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen sticky top-16">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default SidebarMedecin;