
import React, { useState, useEffect } from 'react';
import { UserRole, Patient, Doctor } from '../types';
import { getPatients, getDoctors } from '../services/apiService';
import { LogoIcon } from './icons';

interface LoginScreenProps {
  onLogin: (role: UserRole, id: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [users, setUsers] = useState<(Patient | Doctor)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        if (role === UserRole.PATIENT) {
          const patients = await getPatients();
          setUsers(patients);
          setSelectedUserId(patients[0]?.id || '');
        } else {
          const doctors = await getDoctors();
          setUsers(doctors);
          setSelectedUserId(doctors[0]?.id || '');
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
        setError('Failed to load users. Is the backend server running?');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [role]);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as UserRole);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      onLogin(role, selectedUserId);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl">
        <div className="text-center">
            <div className="flex justify-center items-center mb-4">
                <LogoIcon size={12}/>
            </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Select a role to simulate login
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="role" className="sr-only">Role</label>
              <select
                id="role"
                value={role}
                onChange={handleRoleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              >
                <option value={UserRole.PATIENT}>Patient</option>
                <option value={UserRole.DOCTOR}>Doctor</option>
              </select>
            </div>
            <div>
              <label htmlFor="user" className="sr-only">User</label>
              <select
                id="user"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                disabled={loading}
              >
                {loading ? <option>Loading...</option> : users.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading || !selectedUserId}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
