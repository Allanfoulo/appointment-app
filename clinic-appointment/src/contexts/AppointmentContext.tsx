import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appointment, AppointmentRequest, User, Doctor } from '../types';

interface AppointmentContextType {
  appointments: Appointment[];
  doctors: Doctor[];
  loading: boolean;
  createAppointment: (request: AppointmentRequest) => Promise<boolean>;
  updateAppointmentStatus: (appointmentId: string, status: Appointment['status'], notes?: string) => Promise<boolean>;
  cancelAppointment: (appointmentId: string) => Promise<boolean>;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => Promise<boolean>;
  refreshAppointments: () => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export function useAppointments() {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
}

interface AppointmentProviderProps {
  children: React.ReactNode;
}

export function AppointmentProvider({ children }: AppointmentProviderProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load appointments
      const appointmentsResponse = await fetch('/data/appointments.json');
      const appointmentsData = await appointmentsResponse.json();
      setAppointments(appointmentsData.appointments);
      
      // Load users (including doctors)
      const usersResponse = await fetch('/data/users.json');
      const usersData = await usersResponse.json();
      setDoctors(usersData.doctors);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createAppointment = async (request: AppointmentRequest): Promise<boolean> => {
    try {
      const newAppointment: Appointment = {
        id: `appt_${Date.now()}`,
        ...request,
        status: 'pending',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setAppointments(prev => [...prev, newAppointment]);
      
      // In a real app, this would save to a backend
      return true;
    } catch (error) {
      console.error('Error creating appointment:', error);
      return false;
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string, 
    status: Appointment['status'], 
    notes?: string
  ): Promise<boolean> => {
    try {
      setAppointments(prev => 
        prev.map(appt => 
          appt.id === appointmentId 
            ? { 
                ...appt, 
                status, 
                notes: notes || appt.notes,
                updatedAt: new Date().toISOString()
              }
            : appt
        )
      );
      return true;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return false;
    }
  };

  const cancelAppointment = async (appointmentId: string): Promise<boolean> => {
    try {
      setAppointments(prev => 
        prev.map(appt => 
          appt.id === appointmentId 
            ? { ...appt, status: 'cancelled', updatedAt: new Date().toISOString() }
            : appt
        )
      );
      return true;
    } catch (error) {
      console.error('Error canceling appointment:', error);
      return false;
    }
  };

  const rescheduleAppointment = async (
    appointmentId: string, 
    newDate: string, 
    newTime: string
  ): Promise<boolean> => {
    try {
      setAppointments(prev => 
        prev.map(appt => 
          appt.id === appointmentId 
            ? { 
                ...appt, 
                date: newDate, 
                time: newTime, 
                updatedAt: new Date().toISOString()
              }
            : appt
        )
      );
      return true;
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      return false;
    }
  };

  const refreshAppointments = async () => {
    await loadData();
  };

  const value: AppointmentContextType = {
    appointments,
    doctors,
    loading,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    rescheduleAppointment,
    refreshAppointments
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
}
