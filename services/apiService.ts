import { Patient, Doctor, Session, ExercisePreset } from '../types';

const API_BASE_URL = '';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.statusText} - ${errorText}`);
  }
  return response.json();
};

const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return handleResponse(response);
  },

  post: async <T>(endpoint: string, data: any): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

export const getDoctors = (): Promise<Doctor[]> => {
  return api.get<Doctor[]>('/api/doctors');
};

export const getDoctorById = (doctorId: string): Promise<Doctor> => {
  return api.get<Doctor>(`/api/doctors/${doctorId}`);
};

export const getPatients = (): Promise<Patient[]> => {
  return api.get<Patient[]>('/api/patients');
};

export const getExercisePresets = (): Promise<ExercisePreset[]> => {
  return api.get<ExercisePreset[]>('/api/exercises');
};

export const getSessionsForPatient = (patientId: string): Promise<Session[]> => {
  return api.get<Session[]>(`/api/sessions/patients/${patientId}/sessions`);
};

export const saveSession = (sessionData: Omit<Session, 'id'>): Promise<Session> => {
  return api.post<Session>('/api/sessions/sessions', sessionData);
};

export const getHealth = (): Promise<{status: string}> => {
    return api.get<{status: string}>('/api/health');
}
