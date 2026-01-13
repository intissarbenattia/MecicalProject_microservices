import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const Alert = ({ type = 'info', message, onClose }) => {
  const types = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-800',
      icon: <FiCheckCircle className="text-green-500" size={20} />
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-800',
      icon: <FiAlertCircle className="text-red-500" size={20} />
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-800',
      icon: <FiAlertCircle className="text-yellow-500" size={20} />
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-800',
      icon: <FiInfo className="text-blue-500" size={20} />
    }
  };

  const config = types[type];

  return (
    <div className={`${config.bgColor} ${config.borderColor} border-l-4 p-4 rounded-lg shadow-sm animate-fadeIn`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className={`ml-3 flex-1 ${config.textColor}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <FiX size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;