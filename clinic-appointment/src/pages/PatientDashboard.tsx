import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Heart, LogOut, Calendar as CalendarIcon, Clock, User, Stethoscope, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Appointment, Doctor, User as UserType } from '../types';

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const { appointments, doctors, loading, createAppointment, cancelAppointment } = useAppointments();
  
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [allUsers, setAllUsers] = useState<UserType[]>([]);

  // Load all users for appointment display
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/data/users.json');
        const data = await response.json();
        const users = [...data.patients, ...data.doctors, ...data.receptionists];
        setAllUsers(users);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  const patientAppointments = appointments.filter(appt => appt.patientId === user?.id);
  const specialties = [...new Set(doctors.map(doctor => doctor.specialty))];
  const availableDoctors = selectedSpecialty 
    ? doctors.filter(doctor => doctor.specialty === selectedSpecialty)
    : doctors;

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const getUserName = (userId: string) => {
    const foundUser = allUsers.find(u => u.id === userId);
    return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : 'Unknown';
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason) {
      setMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const success = await createAppointment({
        patientId: user!.id,
        doctorId: selectedDoctor,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        reason
      });

      if (success) {
        setMessage('Appointment request submitted successfully!');
        // Reset form
        setSelectedSpecialty('');
        setSelectedDoctor('');
        setSelectedDate(undefined);
        setSelectedTime('');
        setReason('');
      } else {
        setMessage('Failed to submit appointment request. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      const success = await cancelAppointment(appointmentId);
      if (success) {
        setMessage('Appointment cancelled successfully.');
      } else {
        setMessage('Failed to cancel appointment. Please try again.');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      confirmed: 'default',
      pending: 'secondary',
      cancelled: 'destructive',
      completed: 'outline'
    };
    return (
      <Badge variant={variants[status] || 'secondary'} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-teal-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900">Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-teal-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Clinic Appointment</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Patient Dashboard</h2>
          <p className="text-gray-600">Request and manage your appointments</p>
        </div>

        {/* Messages */}
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Appointment Form */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-teal-600 mr-2" />
                Request Appointment
              </CardTitle>
              <CardDescription>
                Select a specialty, doctor, and preferred time for your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Specialty</Label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map(specialty => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Doctor</Label>
                  <Select 
                    value={selectedDoctor} 
                    onValueChange={setSelectedDoctor}
                    disabled={!selectedSpecialty}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDoctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.firstName} {doctor.lastName} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Select Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reason for Visit</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please describe the reason for your visit..."
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Request Appointment'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Appointment Stats */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="h-5 w-5 text-teal-600 mr-2" />
                Appointment Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {patientAppointments.filter(a => a.status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-blue-600">Confirmed</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {patientAppointments.filter(a => a.status === 'pending').length}
                  </div>
                  <div className="text-sm text-yellow-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {patientAppointments.filter(a => a.status === 'completed').length}
                  </div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {patientAppointments.filter(a => a.status === 'cancelled').length}
                  </div>
                  <div className="text-sm text-red-600">Cancelled</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments History */}
        <Card className="bg-white shadow-lg mt-8">
          <CardHeader>
            <CardTitle>Your Appointments</CardTitle>
            <CardDescription>
              View and manage all your appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {patientAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                <p className="text-gray-600">Create your first appointment using the form above.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientAppointments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(appointment => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium">
                                {format(new Date(appointment.date), 'MMM dd, yyyy')}
                              </div>
                              <div className="text-sm text-gray-600">
                                {appointment.time}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {getUserName(appointment.doctorId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={appointment.reason}>
                            {appointment.reason}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(appointment.status)}
                            {getStatusBadge(appointment.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {appointment.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
