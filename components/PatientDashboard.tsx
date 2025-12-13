
import React, { useState, useEffect } from 'react';
import { Patient, Session, ExercisePreset, Doctor } from '../types';
import { getSessionsForPatient, saveSession, getDoctorById, getExercisePresets } from '../services/apiService';
import ExerciseSession from './ExerciseSession';

interface PatientDashboardProps {
  patient: Patient;
}

const ExerciseCard: React.FC<{ exercise: ExercisePreset; onStart: () => void; }> = ({ exercise, onStart }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col">
        <h4 className="text-lg font-bold text-blue-600">{exercise.name}</h4>
        <p className="text-gray-600 mt-2 mb-4 flex-grow">{exercise.description}</p>
        <p className="text-sm text-gray-500 mb-4">Duration: {exercise.duration} seconds</p>
        <button
            onClick={onStart}
            className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors"
        >
            Start Session
        </button>
    </div>
);

const PatientDashboard: React.FC<PatientDashboardProps> = ({ patient }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<ExercisePreset | null>(null);
  const [patientDoctor, setPatientDoctor] = useState<Doctor | null>(null);
  const [exercisePresets, setExercisePresets] = useState<ExercisePreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [sessionsData, doctorData, presetsData] = await Promise.all([
          getSessionsForPatient(patient.id),
          getDoctorById(patient.doctorId),
          getExercisePresets()
        ]);
        setSessions(sessionsData);
        setPatientDoctor(doctorData);
        setExercisePresets(presetsData);
      } catch (error) {
        console.error("Failed to load patient data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [patient.id, patient.doctorId]);

  const handleSessionComplete = async (sessionData: Omit<Session, 'id' | 'patientId' | 'doctorId' | 'exercisePresetId'>, exerciseId: string) => {
    try {
        const newSession = await saveSession({
            ...sessionData,
            patientId: patient.id,
            doctorId: patient.doctorId,
            exercisePresetId: exerciseId,
        });
        setSessions(prev => [newSession, ...prev]);
    } catch (error) {
        console.error("Failed to save session", error);
        alert("There was an error saving your session. Please try again.");
    } finally {
        setSelectedExercise(null);
    }
  };
  
  if (selectedExercise) {
    return (
      <ExerciseSession
        exercise={selectedExercise}
        onSessionComplete={handleSessionComplete}
        onCancel={() => setSelectedExercise(null)}
      />
    );
  }

  if (loading) {
      return <div className="text-center text-gray-500 py-10">Loading patient dashboard...</div>
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {patient.name}!</h2>
        <p className="text-gray-600">Your assigned doctor is <strong>{patientDoctor?.name || 'N/A'}</strong>. Here are your prescribed exercises.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-2xl font-bold mb-4">Prescribed Exercises</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercisePresets.map(preset => (
                <ExerciseCard key={preset.id} exercise={preset} onStart={() => setSelectedExercise(preset)} />
            ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-2xl font-bold mb-4">Past Sessions</h3>
        {sessions.length > 0 ? (
            <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exercise</th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frames Recorded</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map(session => {
                const exercise = exercisePresets.find(p => p.id === session.exercisePresetId);
                return (
                    <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(session.date).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exercise?.name || 'Custom Session'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.angles.leftElbow.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.id}</td>
                    </tr>
                )
            })}
            </tbody>
          </table>
          </div>
        ) : (
          <p className="text-gray-500">No past sessions found. Start an exercise to see your progress!</p>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
