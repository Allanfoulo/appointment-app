import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Calendar } from '../components/ui/calendar';
import { Heart, LogOut, Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, AlertCircle, Loader2, FileText, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Appointment, User as UserType } from '../types';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const { appointments, loading, updateAppointmentStatus } = useAppointments();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
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

  const doctorAppointments = appointments.filter(appt => appt.doctorId === user?.id);
  const todayAppointments = doctorAppointments.filter(appt => 
    appt.date === format(new Date(), 'yyyy-MM-dd')
  );
  const selectedDateAppointments = doctorAppointments.filter(appt => 
    appt.date === format(selectedDate, 'yyyy-MM-dd')
  );

  const getUserName = (userId: string) => {
    const foundUser = allUsers.find(u => u.id === userId);
    return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : 'Unknown';
  };

  const getPatientPhone = (userId: string) => {
    const foundUser = allUsers.find(u => u.id === userId);
    return foundUser ? foundUser.phone : 'N/A';
  };

  const handleUpdateStatus = async (appointmentId: string, status: Appointment['status'], appointmentNotes?: string) => {
    setIsUpdating(true);
    setMessage('');

    try {
      const success = await updateAppointmentStatus(appointmentId, status, appointmentNotes);
      if (success) {
        setMessage(`Appointment ${status} successfully!`);
        setSelectedAppointment(null);
        setNotes('');
      } else {
        setMessage('Failed to update appointment. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h2>
          <p className="text-gray-600">Manage your appointments and patient care</p>
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
                    {doctorAppointments.filter(a => a.status === 'pending').length}
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
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {doctorAppointments.filter(a => a.status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-gray-600">Confirmed</div>
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
                    {new Set(doctorAppointments.map(a => a.patientId)).size}
                  </div>
                  <div className="text-sm text-gray-600">Total Patients</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-teal-600 mr-2" />
                Calendar
              </CardTitle>
              <CardDescription>
                Select a date to view appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
              <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                <div className="text-sm font-medium text-teal-800">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="text-sm text-teal-600">
                  {selectedDateAppointments.length} appointment(s)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="bg-white shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 text-teal-600 mr-2" />
                {selectedDate.toDateString() === new Date().toDateString() ? "Today's Schedule" : `Schedule for ${format(selectedDate, 'MMM d')}`}
              </CardTitle>
              <CardDescription>
                Appointments for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments</h3>
                  <p className="text-gray-600">You have no appointments scheduled for this day.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateAppointments
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(appointment => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{appointment.time}</div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(`2000-01-01T${appointment.time}`), 'h:mm a')}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {getUserName(appointment.patientId)}
                            </div>
                            <div className="text-sm text-gray-600">{appointment.reason}</div>
                            <div className="text-xs text-gray-500">
                              Phone: {getPatientPhone(appointment.patientId)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(appointment.status)}
                            {getStatusBadge(appointment.status)}
                          </div>
                          {appointment.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                                disabled={isUpdating}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                                disabled={isUpdating}
                                className="text-red-600 hover:text-red-700"
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                          {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setNotes(appointment.notes || '');
                                  }}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Notes
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Appointment Notes</DialogTitle>
                                  <DialogDescription>
                                    Add or update notes for {getUserName(appointment.patientId)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="notes">Medical Notes</Label>
                                    <Textarea
                                      id="notes"
                                      value={notes}
                                      onChange={(e) => setNotes(e.target.value)}
                                      placeholder="Enter appointment notes, observations, or treatment recommendations..."
                                      rows={6}
                                    />
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => handleUpdateStatus(appointment.id, 'completed', notes)}
                                      disabled={isUpdating}
                                      className="bg-teal-600 hover:bg-teal-700"
                                    >
                                      {isUpdating ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Saving...
                                        </>
                                      ) : (
                                        'Save & Mark Complete'
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedAppointment(null);
                                        setNotes('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Appointments Table */}
        <Card className="bg-white shadow-lg mt-8">
          <CardHeader>
            <CardTitle>All Appointments</CardTitle>
            <CardDescription>
              Complete list of your appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {doctorAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments</h3>
                <p className="text-gray-600">You don't have any appointments yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctorAppointments
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
                            {getUserName(appointment.patientId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {getPatientPhone(appointment.patientId)}
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
                          <div className="max-w-xs truncate text-sm text-gray-600" title={appointment.notes}>
                            {appointment.notes || 'No notes'}
                          </div>
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
