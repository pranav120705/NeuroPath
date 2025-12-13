import { Patient, Doctor, UserRole, Session, ExercisePreset } from '../types';

export const DOCTORS: Doctor[] = [
  { id: 'doc1', name: 'Dr. Evelyn Reed', email: 'e.reed@clinic.com', role: UserRole.DOCTOR },
  { id: 'doc2', name: 'Dr. Samuel Chen', email: 's.chen@clinic.com', role: UserRole.DOCTOR },
];

export const PATIENTS: Patient[] = [
  { id: 'pat1', name: 'John Doe', email: 'j.doe@email.com', role: UserRole.PATIENT, doctorId: 'doc1' },
  { id: 'pat2', name: 'Jane Smith', email: 'j.smith@email.com', role: UserRole.PATIENT, doctorId: 'doc1' },
  { id: 'pat3', name: 'Peter Jones', email: 'p.jones@email.com', role: UserRole.PATIENT, doctorId: 'doc2' },
];

const generateRandomAngles = (length: number, min: number, max: number, noise: number) => {
    return Array.from({ length }, (_, i) => {
        const progress = i / length;
        const baseAngle = min + (max - min) * (0.5 * (1 - Math.cos(progress * Math.PI * (length / 30)))); // Simulate repetitions
        return baseAngle + (Math.random() - 0.5) * noise;
    });
};


export const EXERCISE_PRESETS: ExercisePreset[] = [
  {
    id: 'preset1',
    name: 'Arm Lifts',
    description: 'Raise and lower your arms, focusing on controlled movement at the elbow.',
    duration: 120, // seconds
    benchmarkData: {
      leftElbow: generateRandomAngles(120 * 30, 90, 170, 2), // 30 fps approximation
      rightElbow: generateRandomAngles(120 * 30, 90, 170, 2),
      leftKnee: generateRandomAngles(120 * 30, 175, 180, 1),
      rightKnee: generateRandomAngles(120 * 30, 175, 180, 1),
    }
  },
  {
    id: 'preset2',
    name: 'Half Squats',
    description: 'Perform half squats, ensuring your knees do not go past your toes.',
    duration: 120, // seconds
    benchmarkData: {
      leftElbow: generateRandomAngles(120 * 30, 160, 170, 2),
      rightElbow: generateRandomAngles(120 * 30, 160, 170, 2),
      leftKnee: generateRandomAngles(120 * 30, 90, 175, 3),
      rightKnee: generateRandomAngles(120 * 30, 90, 175, 3),
    }
  }
];


let SESSIONS: Session[] = [
  {
    id: 'sess1',
    patientId: 'pat1',
    doctorId: 'doc1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    exercisePresetId: 'preset2',
    angles: {
      leftElbow: generateRandomAngles(100, 165, 175, 5),
      rightElbow: generateRandomAngles(100, 162, 173, 5),
      leftKnee: generateRandomAngles(100, 100, 175, 8),
      rightKnee: generateRandomAngles(100, 105, 178, 8),
    }
  },
  {
    id: 'sess2',
    patientId: 'pat1',
    doctorId: 'doc1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    exercisePresetId: 'preset2',
    angles: {
      leftElbow: generateRandomAngles(120, 160, 170, 4),
      rightElbow: generateRandomAngles(120, 160, 170, 4),
      leftKnee: generateRandomAngles(120, 95, 178, 5),
      rightKnee: generateRandomAngles(120, 98, 179, 5),
    }
  },
  {
    id: 'sess3',
    patientId: 'pat2',
    doctorId: 'doc1',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    exercisePresetId: 'preset1',
    angles: {
      leftElbow: generateRandomAngles(90, 80, 160, 10),
      rightElbow: generateRandomAngles(90, 85, 165, 10),
      leftKnee: generateRandomAngles(90, 170, 180, 2),
      rightKnee: generateRandomAngles(90, 170, 180, 2),
    }
  }
];

export const getSessionsForPatient = (patientId: string): Session[] => {
  return SESSIONS.filter(s => s.patientId === patientId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getDoctorById = (doctorId: string): Doctor | undefined => {
    return DOCTORS.find(d => d.id === doctorId);
};

export const saveSession = (patientId: string, doctorId: string, sessionData: Omit<Session, 'id' | 'patientId' | 'doctorId'>): Session => {
  const newSession: Session = {
    id: `sess${SESSIONS.length + 1}`,
    patientId,
    doctorId,
    ...sessionData
  };
  SESSIONS.push(newSession);
  return newSession;
};