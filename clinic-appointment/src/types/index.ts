export type UserRole = 'patient' | 'doctor' | 'receptionist';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
}

export interface Patient extends User {
  role: 'patient';
  dateOfBirth: string;
  medicalHistory?: string[];
  insuranceId?: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialty: string;
  licenseNumber: string;
  yearsOfExperience: number;
  availability: TimeSlot[];
  bio?: string;
}

export interface Receptionist extends User {
  role: 'receptionist';
  department: string;
}

export interface TimeSlot {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO date string
  time: string; // HH:mm format
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id'>) => Promise<boolean>;
}

export interface AppointmentRequest {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'appointment' | 'availability';
  status?: AppointmentStatus;
}
