import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Heart, LogOut, Users, Stethoscope, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-teal-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  // If user role is specific, show their dashboard
  if (user.role === 'patient') {
    return <PatientDashboard />;
  }
  if (user.role === 'doctor') {
    return <DoctorDashboard />;
  }
  if (user.role === 'receptionist') {
    return <ReceptionistDashboard />;
  }

  // Fallback dashboard selector (this shouldn't normally be reached)
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
              <span className="text-sm text-gray-600">
                Welcome, {user.firstName} {user.lastName}
              </span>
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
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="text-center">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Patients Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600">
                Request and manage your appointments
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-3">
                <Stethoscope className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Doctors Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600">
                Manage your appointments and availability
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="text-center">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-3">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Receptionists Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600">
                Manage clinic appointments and schedules
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Error Message */}
        <Card className="bg-white shadow-lg">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Dashboard Selection
            </h2>
            <p className="text-gray-600 mb-4">
              Your account role: <span className="font-medium">{user.role}</span>
            </p>
            <p className="text-sm text-gray-500">
              Please contact support if you're seeing this message.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
