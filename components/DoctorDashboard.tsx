
import React, { useState, useMemo, useEffect } from 'react';
import { Doctor, Patient, Session, ExercisePreset } from '../types';
import { getPatients, getSessionsForPatient, getExercisePresets } from '../services/apiService';
import { calculateAllStats } from '../services/poseUtils';
import AnalysisChart from './AnalysisChart';
import StatsTable from './StatsTable';

interface DoctorDashboardProps {
  doctor: Doctor;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctor }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [exercisePresets, setExercisePresets] = useState<ExercisePreset[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientSessions, setPatientSessions] = useState<Session[]>([]);
  const [session1Id, setSession1Id] = useState<string>('');
  const [session2Id, setSession2Id] = useState<string>('');
  const [comparisonTarget, setComparisonTarget] = useState<'session' | 'benchmark'>('session');
  const [loading, setLoading] = useState({ page: true, sessions: false });

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(prev => ({ ...prev, page: true }));
      try {
        const [patientsData, presetsData] = await Promise.all([getPatients(), getExercisePresets()]);
        setPatients(patientsData);
        setExercisePresets(presetsData);
        if (patientsData.length > 0) {
          setSelectedPatientId(patientsData[0].id);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(prev => ({ ...prev, page: false }));
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedPatientId) return;

    const fetchSessions = async () => {
      setLoading(prev => ({ ...prev, sessions: true }));
      try {
        const sessions = await getSessionsForPatient(selectedPatientId);
        setPatientSessions(sessions);
        setSession1Id(sessions[0]?.id || '');
        setSession2Id(sessions[1]?.id || sessions[0]?.id || '');
        setComparisonTarget('session');
      } catch (error) {
        console.error(`Failed to fetch sessions for patient ${selectedPatientId}`, error);
        setPatientSessions([]);
      } finally {
        setLoading(prev => ({ ...prev, sessions: false }));
      }
    };

    fetchSessions();
  }, [selectedPatientId]);

  const selectedSession1 = useMemo(() => patientSessions.find(s => s.id === session1Id), [patientSessions, session1Id]);
  const canCompareWithBenchmark = !!selectedSession1?.exercisePresetId;

  useEffect(() => {
    if (!canCompareWithBenchmark) {
        setComparisonTarget('session');
    }
  }, [canCompareWithBenchmark]);

  const { session1, session2, stats } = useMemo(() => {
    const s1 = selectedSession1;
    if (!s1) return { session1: null, session2: null, stats: null };

    let s2: Session | null = null;
    if (comparisonTarget === 'benchmark' && s1.exercisePresetId) {
        const preset = exercisePresets.find(p => p.id === s1.exercisePresetId);
        if(preset){
            s2 = {
                id: 'benchmark',
                patientId: 'benchmark',
                doctorId: 'benchmark',
                date: 'N/A',
                angles: preset.benchmarkData,
                exercisePresetId: preset.id,
            };
        }
    } else {
        s2 = patientSessions.find(s => s.id === session2Id) ?? null;
    }

    if (s1 && s2) {
      const calculatedStats = calculateAllStats(s1.angles, s2.angles);
      return { session1: s1, session2: s2, stats: calculatedStats };
    }
    return { session1: s1, session2: null, stats: null };
  }, [selectedSession1, session2Id, comparisonTarget, patientSessions, exercisePresets]);

  if (loading.page) {
    return <div className="text-center text-gray-500 py-10">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Doctor's Analytical Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <div>
            <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700">Select Patient</label>
            <select id="patient-select" value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              {patients.map((p: Patient) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="session1-select" className="block text-sm font-medium text-gray-700">Select Session</label>
            <select id="session1-select" value={session1Id} onChange={(e) => setSession1Id(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" disabled={loading.sessions || patientSessions.length === 0}>
               {loading.sessions ? <option>Loading...</option> : patientSessions.map(s => <option key={s.id} value={s.id}>{new Date(s.date).toLocaleString()}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compare With</label>
            <div className="flex space-x-4">
                <label className="flex items-center">
                    <input type="radio" value="session" checked={comparisonTarget === 'session'} onChange={() => setComparisonTarget('session')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" />
                    <span className="ml-2 text-sm text-gray-700">Another Session</span>
                </label>
                <label className="flex items-center">
                    <input type="radio" value="benchmark" checked={comparisonTarget === 'benchmark'} onChange={() => setComparisonTarget('benchmark')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" disabled={!canCompareWithBenchmark}/>
                    <span className={`ml-2 text-sm ${!canCompareWithBenchmark ? 'text-gray-400' : 'text-gray-700'}`}>Benchmark</span>
                </label>
            </div>
           </div>
        </div>
         {comparisonTarget === 'session' && (
             <div className="mt-4">
                <label htmlFor="session2-select" className="block text-sm font-medium text-gray-700">Select Second Session</label>
                <select id="session2-select" value={session2Id} onChange={(e) => setSession2Id(e.target.value)} className="mt-1 block w-full md:w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" disabled={loading.sessions || patientSessions.length === 0}>
                    {loading.sessions ? <option>Loading...</option> : patientSessions.map(s => <option key={s.id} value={s.id}>{new Date(s.date).toLocaleString()}</option>)}
                </select>
             </div>
         )}
      </div>
      
      {loading.sessions ? (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">Loading session data...</div>
      ) : session1 && session2 && stats ? (
        <>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Angular Movement Comparison</h3>
                 <AnalysisChart session1={session1} session2={session2} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Statistical Analysis</h3>
                <StatsTable stats={stats} />
            </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">{!selectedPatientId ? 'Please select a patient.' : patientSessions.length === 0 ? 'This patient has no recorded sessions.' : 'Select a comparison to see the analysis.'}</p>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
