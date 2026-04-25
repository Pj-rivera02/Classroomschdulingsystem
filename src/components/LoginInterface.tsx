import { useState } from 'react';
import { Building2, LogIn } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Chatbot } from './Chatbot';

interface LoginInterfaceProps {
  onLogin: () => void;
}

export function LoginInterface({ onLogin }: LoginInterfaceProps) {
  const [mode, setMode] = useState<'select' | 'admin' | 'classroom'>('select');
  const [email, setEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = dataService.login(email);
    if (user && user.role === 'admin') {
      onLogin();
    } else {
      setError('Invalid admin credentials');
    }
  };

  const handleClassroomAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const classroom = dataService.getClassroomByRoomNumber(roomNumber);
    if (classroom) {
      const user = dataService.getUsers().find(u => u.assignedClassroomId === classroom.id);
      if (user) {
        dataService.setCurrentUser(user.id);
      }
      onLogin();
    } else {
      setError('Room not found');
    }
  };

  if (mode === 'select') {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Classroom Scheduling System
              </h1>
              <p className="text-xl text-blue-200">
                Real-time room availability management
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => setMode('classroom')}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-left hover:bg-white/15 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Classroom Interface</h2>
                <p className="text-blue-200 leading-relaxed">
                  Access the room interface to update availability status from inside the classroom
                </p>
                <div className="mt-6 flex items-center text-blue-300 font-medium group-hover:text-white transition-colors">
                  Access Room
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => setMode('admin')}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-left hover:bg-white/15 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
                    <LogIn className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h2>
                <p className="text-blue-200 leading-relaxed">
                  Manage all classrooms from the central administration interface
                </p>
                <div className="mt-6 flex items-center text-emerald-300 font-medium group-hover:text-white transition-colors">
                  Admin Login
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-block bg-blue-900/50 backdrop-blur-sm border border-blue-500/30 rounded-xl px-6 py-3">
                <p className="text-blue-200 text-sm">
                  <span className="font-semibold text-blue-100">Demo Credentials:</span> Admin: admin@school.edu | Any Room Number: 101-306
                </p>
              </div>
            </div>
          </div>
        </div>
        <Chatbot />
      </>
    );
  }

  if (mode === 'admin') {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <button
              onClick={() => setMode('select')}
              className="text-blue-300 hover:text-white mb-6 flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-xl mb-4">
                  <LogIn className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Login</h2>
                <p className="text-slate-600">Access the central dashboard</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@school.edu"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Login to Dashboard
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500 text-center">
                  Demo: admin@school.edu
                </p>
              </div>
            </div>
          </div>
        </div>
        <Chatbot />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setMode('select')}
            className="text-blue-300 hover:text-white mb-6 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Classroom Access</h2>
              <p className="text-slate-600">Enter your room number</p>
            </div>

            <form onSubmit={handleClassroomAccess} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room Number
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g., 101"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center text-2xl font-semibold"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Access Room
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500 text-center">
                Available rooms: 101, 102, 203, 204, 305, 306
              </p>
            </div>
          </div>
        </div>
      </div>
      <Chatbot />
    </>
  );
}
