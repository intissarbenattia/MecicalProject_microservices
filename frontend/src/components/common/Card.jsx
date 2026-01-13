import React from 'react';

const Card = ({ title, subtitle, children, className = '', actions }) => {
  return (
    <div className={`card ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;