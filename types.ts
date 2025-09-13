// Using global `posenet` from CDN script
declare const posenet: any;

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Patient extends User {
  role: UserRole.PATIENT;
  doctorId: string;
}

export interface Doctor extends User {
  role: UserRole.DOCTOR;
}

export interface Keypoint {
  position: { x: number; y: number };
  part: string;
  score: number;
}

export interface Pose {
  keypoints: Keypoint[];
  score: number;
}

export interface JointAngles {
  leftElbow: number | null;
  rightElbow: number | null;
  leftKnee: number | null;
  rightKnee: number | null;
}

export interface Session {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO string
  angles: {
    leftElbow: number[];
    rightElbow: number[];
    leftKnee: number[];
    rightKnee: number[];
  };
  exercisePresetId?: string; // Link to the exercise preset
}

export interface Stats {
  mad: number;
  mse: number;
  mape: number;
}

export interface ExercisePreset {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  benchmarkData: Session['angles'];
}
