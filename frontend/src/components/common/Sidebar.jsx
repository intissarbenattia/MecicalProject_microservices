import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiCalendar, FiFileText, FiUser, FiClock } from 'react-icons/fi';

const Sidebar = () => {
  const menuItems = [
    {
      name: 'Tableau de bord',
      path: '/patient/dashboard',
      icon: FiHome
    },
    {
      name: 'Mon Profil',
      path: '/patient/profile',
      icon: FiUser
    },
    {
      name: 'Rendez-vous',
      path: '/patient/appointments',
      icon: FiCalendar
    },
    {
      name: 'Documents',
      path: '/patient/documents',
      icon: FiFileText
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

export default Sidebar;