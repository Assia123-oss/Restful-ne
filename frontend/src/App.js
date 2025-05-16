import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/common/SideBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SlotRequests from './pages/SlotRequests';
import Users from './pages/Users';
import Vehicles from './pages/Vehicles';
import ParkingSlots from './pages/ParkingSlots';
import Logs from './pages/Logs';
import { isAdmin } from './utils/auth';

// PrivateRoute component for protected routes
const PrivateRoute = ({ children }) => {
  return isAdmin() ? children : <Navigate to="/login" />;
};

// Layout component to handle Sidebar rendering
const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="flex">
      {!isLoginPage && isAdmin() && <Sidebar />}
      <div className={`flex-1 ${!isLoginPage && isAdmin() ? 'md:ml-64' : ''} bg-accent min-h-screen`}>
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/slot-requests"
            element={
              <PrivateRoute>
                <SlotRequests />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <PrivateRoute>
                <Vehicles />
              </PrivateRoute>
            }
          />
          <Route
            path="/parking-slots"
            element={
              <PrivateRoute>
                <ParkingSlots />
              </PrivateRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <PrivateRoute>
                <Logs />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;