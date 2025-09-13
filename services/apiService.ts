import { Patient, Doctor, Session, ExercisePreset } from '../types';
import * as mockApi from './mockDataService';

const ARTIFICIAL_DELAY_MS = 300;

/**
 * Simulates a network request delay.
 * @param data The data to be returned after the delay.
 * @returns A promise that resolves with the data.
 */
const simulateApiCall = <T>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Create a deep copy to prevent mutations of the mock data source
            resolve(JSON.parse(JSON.stringify(data)));
        }, ARTIFICIAL_DELAY_MS);
    });
};

/**
 * Simulates a failing API call.
 * @param message The error message.
 * @returns A promise that rejects with an error.
 */
const simulateApiError = <T>(message: string): Promise<T> => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(message));
        }, ARTIFICIAL_DELAY_MS);
    });
}

export const getDoctors = (): Promise<Doctor[]> => {
  return simulateApiCall(mockApi.DOCTORS);
};

export const getDoctorById = (doctorId: string): Promise<Doctor> => {
    const doctor = mockApi.getDoctorById(doctorId);
    if (doctor) {
        return simulateApiCall(doctor);
    }
    return simulateApiError(`Doctor with id ${doctorId} not found.`);
};

export const getPatients = (): Promise<Patient[]> => {
    return simulateApiCall(mockApi.PATIENTS);
};

export const getExercisePresets = (): Promise<ExercisePreset[]> => {
    return simulateApiCall(mockApi.EXERCISE_PRESETS);
};

export const getSessionsForPatient = (patientId: string): Promise<Session[]> => {
  const sessions = mockApi.getSessionsForPatient(patientId);
  return simulateApiCall(sessions);
};

export const saveSession = (sessionData: Omit<Session, 'id'>): Promise<Session> => {
    // The mock saveSession function has a different signature than the API one.
    // This adapts the call to match the mock service.
    const { patientId, doctorId, ...restOfData } = sessionData;
    
    // The mock function expects the rest of the data without patientId and doctorId
    const sessionToSave: Omit<Session, 'id' | 'patientId' | 'doctorId'> = restOfData;

    const newSession = mockApi.saveSession(patientId, doctorId, sessionToSave);
    return simulateApiCall(newSession);
};
