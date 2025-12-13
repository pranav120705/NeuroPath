
import React, { useState, useCallback } from 'react';
import { User, UserRole, Patient, Doctor } from './types';
import { getPatients, getDoctors } from './services/apiService';
import LoginScreen from './components/LoginScreen';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = useCallback(async (role: UserRole, id: string) => {
    let user: User | undefined;
    try {
        if (role === UserRole.PATIENT) {
            const patients = await getPatients();
            user = patients.find((p: Patient) => p.id === id);
        } else if (role === UserRole.DOCTOR) {
            const doctors = await getDoctors();
            user = doctors.find((d: Doctor) => d.id === id);
        }
        if (user) {
            setCurrentUser(user);
        } else {
            alert('User not found!');
        }
    } catch (error) {
        console.error("Login failed", error);
        alert('Failed to log in. Please check if the backend server is running.');
    }
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const renderContent = () => {
    if (!currentUser) {
      return <LoginScreen onLogin={handleLogin} />;
    }

    switch (currentUser.role) {
      case UserRole.PATIENT:
        return <PatientDashboard patient={currentUser as Patient} />;
      case UserRole.DOCTOR:
        return <DoctorDashboard doctor={currentUser as Doctor} />;
      default:
        return <div className="text-center p-8">Unsupported user role.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <LogoIcon />
            <h1 className="text-2xl font-bold text-blue-600">RehabTrack</h1>
          </div>
          {currentUser && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, <span className="font-semibold">{currentUser.name}</span> ({currentUser.role})</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </header>
      <main className="container mx-auto p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
