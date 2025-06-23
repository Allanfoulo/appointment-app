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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Heart, LogOut, Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, AlertCircle, Loader2, Plus, Users, Stethoscope, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { Appointment, Doctor, User as UserType } from '../types';

export default function ReceptionistDashboard() {
  const { user, logout } = useAuth();
  const { appointments, doctors, loading, createAppointment, updateAppointmentStatus, cancelAppointment } = useAppointments();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDoctor, setFilterDoctor] = useState<string>('all');

  // Load all users
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

  const patients = allUsers.filter(u => u.role === 'patient');
  const todayAppointments = appointments.filter(appt => 
    appt.date === format(new Date(), 'yyyy-MM-dd')
  );

  // Filter appointments based on selected filters
  const filteredAppointments = appointments.filter(appt => {
    if (filterStatus !== 'all' && appt.status !== filterStatus) return false;
    if (filterDoctor !== 'all' && appt.doctorId !== filterDoctor) return false;
    return true;
  });

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const getUserName = (userId: string) => {
    const foundUser = allUsers.find(u => u.id === userId);
    return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : 'Unknown';
  };

  const getUserInfo = (userId: string) => {
    const foundUser = allUsers.find(u => u.id === userId);
    return foundUser || null;
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.patientId || !newAppointment.doctorId || !newAppointment.date || !newAppointment.time || !newAppointment.reason) {
      setMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const success = await createAppointment(newAppointment);
      if (success) {
        setMessage('Appointment created successfully!');
        setNewAppointment({
          patientId: '',
          doctorId: '',
          date: '',
          time: '',
          reason: ''
        });
        setIsCreatingAppointment(false);
      } else {
        setMessage('Failed to create appointment. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, status: Appointment['status']) => {
    const success = await updateAppointmentStatus(appointmentId, status);
    if (success) {
      setMessage(`Appointment ${status} successfully!`);
    } else {
      setMessage('Failed to update appointment. Please try again.');
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
          <h2 className="text-2xl font-bold text-gray-900">Loading dashboard...</h2>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Receptionist Dashboard</h2>
            <p className="text-gray-600">Manage clinic appointments and schedules</p>
          </div>
          <Dialog open={isCreatingAppointment} onOpenChange={setIsCreatingAppointment}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Appointment</DialogTitle>
                <DialogDescription>
                  Schedule a new appointment for a patient
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={newAppointment.patientId} onValueChange={(value) => 
                    setNewAppointment(prev => ({ ...prev, patientId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName} - {patient.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Doctor</Label>
                  <Select value={newAppointment.doctorId} onValueChange={(value) => 
                    setNewAppointment(prev => ({ ...prev, doctorId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.firstName} {doctor.lastName} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Select value={newAppointment.time} onValueChange={(value) => 
                      setNewAppointment(prev => ({ ...prev, time: value }))
                    }>
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
                </div>

                <div className="space-y-2">
                  <Label>Reason for Visit</Label>
                  <Textarea
                    value={newAppointment.reason}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Describe the reason for the visit..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1 bg-teal-600 hover:bg-teal-700">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Appointment'
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreatingAppointment(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Messages */}
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {todayAppointments.length}
                  </div>
                  <div className="text-sm text-gray-600">Today's Appointments</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {appointments.filter(a => a.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Approval</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {doctors.length}
                  </div>
                  <div className="text-sm text-gray-600">Active Doctors</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {patients.length}
                  </div>
                  <div className="text-sm text-gray-600">Registered Patients</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">All Appointments</TabsTrigger>
            <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
            <TabsTrigger value="doctors">Doctor Management</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Clinic Appointments</CardTitle>
                    <CardDescription>
                      Manage all appointments across the clinic
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Doctors</SelectItem>
                        {doctors.map(doctor => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.firstName} {doctor.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(appointment => {
                        const patient = getUserInfo(appointment.patientId);
                        const doctor = getUserInfo(appointment.doctorId);
                        return (
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
                              <div>
                                <div className="font-medium">{getUserName(appointment.patientId)}</div>
                                {patient && patient.role === 'patient' && (
                                  <div className="text-sm text-gray-600">
                                    ID: {(patient as any).insuranceId || 'N/A'}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{getUserName(appointment.doctorId)}</div>
                                {doctor && doctor.role === 'doctor' && (
                                  <div className="text-sm text-gray-600">
                                    {(doctor as any).specialty}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {patient?.phone || 'N/A'}
                                </div>
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
                              <div className="flex space-x-1">
                                {appointment.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                                      className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-auto"
                                    >
                                      Confirm
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCancelAppointment(appointment.id)}
                                      className="text-red-600 hover:text-red-700 text-xs px-2 py-1 h-auto"
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                )}
                                {appointment.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                    className="text-red-600 hover:text-red-700 text-xs px-2 py-1 h-auto"
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                  <CardDescription>Select date to view schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    Schedule for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </CardTitle>
                  <CardDescription>
                    All appointments for the selected date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {appointments
                    .filter(appt => appt.date === format(selectedDate, 'yyyy-MM-dd'))
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(appointment => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{appointment.time}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {getUserName(appointment.patientId)} → {getUserName(appointment.doctorId)}
                            </div>
                            <div className="text-sm text-gray-600">{appointment.reason}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(appointment.status)}
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="doctors">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Doctor Management</CardTitle>
                <CardDescription>
                  Manage doctor schedules and information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map(doctor => (
                    <Card key={doctor.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-teal-100 p-2 rounded-full">
                            <Stethoscope className="h-6 w-6 text-teal-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{doctor.firstName} {doctor.lastName}</CardTitle>
                            <CardDescription>{doctor.specialty}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            {doctor.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            {doctor.phone}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            {doctor.yearsOfExperience} years experience
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            Appointments Today: {todayAppointments.filter(a => a.doctorId === doctor.id).length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total: {appointments.filter(a => a.doctorId === doctor.id).length}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
