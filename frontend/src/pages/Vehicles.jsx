import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { getVehicles } from '../utils/api';
import Pagination from '../components/common/Pagination';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getVehicles(page, limit, debouncedSearch);
      setVehicles(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch vehicles');
    }
    setLoading(false);
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return (
    <div className="container mx-auto p-6 bg-accent min-h-screen">
      <h1 className="text-3xl font-bold text-primary mb-6">Vehicles</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by plate number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full sm:w-1/2"
        />
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Plate Number</th>
                <th className="p-3 text-left">Vehicle Type</th>
                <th className="p-3 text-left">Size</th>
                <th className="p-3 text-left">User ID</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b hover:bg-accent">
                  <td className="p-3">{vehicle.id}</td>
                  <td className="p-3">{vehicle.plate_number}</td>
                  <td className="p-3">{vehicle.vehicle_type}</td>
                  <td className="p-3">{vehicle.size}</td>
                  <td className="p-3">{vehicle.user_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination meta={meta} setPage={setPage} />
    </div>
  );
};

export default Vehicles;