import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removeToken } from '../../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold">
          Parking Admin
        </Link>
        <div className="space-x-4">
          <Link to="/dashboard" className="hover:text-accent">
            Dashboard
          </Link>
          <Link to="/slot-requests" className="hover:text-accent">
            Slot Requests
          </Link>
          <Link to="/logs" className="hover:text-accent">
            Logs
          </Link>
          <button
            onClick={handleLogout}
            className="bg-secondary px-3 py-1 rounded hover:bg-blue-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;