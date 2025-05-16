import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getSlotRequests, getUsers, getVehicles, getParkingSlots } from '../utils/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalUsers: 0,
    totalVehicles: 0,
    totalSlots: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const [requestsRes, usersRes, vehiclesRes, slotsRes] = await Promise.all([
          getSlotRequests(1, 1000, ''),
          getUsers(1, 1000, ''),
          getVehicles(1, 1000, ''),
          getParkingSlots(1, 1000, ''),
        ]);

        const requests = requestsRes.data.data;
        const pending = requests.filter((r) => r.request_status === 'pending').length;
        const approved = requests.filter((r) => r.request_status === 'approved').length;
        const rejected = requests.filter((r) => r.request_status === 'rejected').length;

        setStats({
          pending,
          approved,
          rejected,
          totalUsers: usersRes.data.meta.totalItems,
          totalVehicles: vehiclesRes.data.meta.totalItems,
          totalSlots: slotsRes.data.meta.totalItems,
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch stats');
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  const pieData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [stats.pending, stats.approved, stats.rejected],
        backgroundColor: ['#F59E0B', '#10B981', '#EF4444'],
        borderColor: ['#D97706', '#059669', '#DC2626'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto p-6 bg-accent min-h-screen">
      <h1 className="text-3xl font-bold text-primary mb-6">Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-primary mb-4">Slot Request Status</h2>
            <Pie
              data={pieData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: { backgroundColor: '#1D4ED8' },
                },
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'bg-primary' },
              { label: 'Total Vehicles', value: stats.totalVehicles, color: 'bg-secondary' },
              { label: 'Total Slots', value: stats.totalSlots, color: 'bg-green-500' },
              { label: 'Pending Requests', value: stats.pending, color: 'bg-yellow-500' },
            ].map((item) => (
              <div key={item.label} className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-700">{item.label}</h3>
                <p className={`text-2xl font-bold text-white ${item.color} p-2 rounded mt-2`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;