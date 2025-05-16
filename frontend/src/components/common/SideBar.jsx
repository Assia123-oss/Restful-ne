import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { removeToken } from '../../utils/auth';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <div>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'}
      </button>
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-primary text-white transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40 shadow-lg`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/slot-requests', label: 'Slot Requests' },
            { to: '/users', label: 'Users' },
            { to: '/vehicles', label: 'Vehicles' },
            { to: '/parking-slots', label: 'Parking Slots' },
            { to: '/logs', label: 'Activity Logs' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-secondary text-white' : 'hover:bg-secondary/80'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="p-3 text-left rounded-lg hover:bg-red-500 transition-colors"
          >
            Logout
          </button>
        </nav>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;