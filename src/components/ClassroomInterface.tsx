import { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Classroom, ClassroomStatus } from '../types';
import { dataService } from '../services/dataService';

interface ClassroomInterfaceProps {
  roomNumber: string;
}

export function ClassroomInterface({ roomNumber }: ClassroomInterfaceProps) {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [status, setStatus] = useState<ClassroomStatus>('available');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadClassroom = () => {
      const room = dataService.getClassroomByRoomNumber(roomNumber);
      if (room) {
        setClassroom(room);
        setStatus(room.status);
        setReason(room.reason);
      }
    };

    loadClassroom();
    const unsubscribe = dataService.subscribe(loadClassroom);
    return unsubscribe;
  }, [roomNumber]);

  const handleStatusUpdate = async () => {
    if (!classroom) return;

    setLoading(true);
    setMessage('');

    const estimatedAvailableAt = duration
      ? new Date(Date.now() + parseInt(duration) * 60000).toISOString()
      : null;

    const updated = dataService.updateClassroom(
      classroom.id,
      {
        status,
        reason,
        estimatedAvailableAt,
      },
      'classroom'
    );

    if (updated) {
      setMessage('Status updated successfully');
      setTimeout(() => setMessage(''), 3000);
    }

    setLoading(false);
  };

  const getStatusColor = (s: ClassroomStatus) => {
    switch (s) {
      case 'available':
        return 'bg-emerald-500';
      case 'occupied':
        return 'bg-amber-500';
      case 'unavailable':
        return 'bg-red-500';
    }
  };

  const getStatusIcon = (s: ClassroomStatus) => {
    switch (s) {
      case 'available':
        return <CheckCircle className="w-16 h-16" />;
      case 'occupied':
        return <Clock className="w-16 h-16" />;
      case 'unavailable':
        return <XCircle className="w-16 h-16" />;
    }
  };

  if (!classroom) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-600">Room {roomNumber} not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className={`${getStatusColor(classroom.status)} p-8 text-white`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Room {classroom.roomNumber}</h1>
                <p className="text-lg opacity-90">{classroom.building} • {classroom.department}</p>
              </div>
              <div className="opacity-90">
                {getStatusIcon(classroom.status)}
              </div>
            </div>

            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-sm uppercase tracking-wide mb-1 opacity-80">Current Status</p>
              <p className="text-3xl font-bold capitalize">{classroom.status}</p>
              {classroom.reason && (
                <p className="text-sm mt-2 opacity-90">{classroom.reason}</p>
              )}
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Update Room Status</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setStatus('available')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  status === 'available'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 hover:border-emerald-300 text-slate-600'
                }`}
              >
                <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${
                  status === 'available' ? 'text-emerald-500' : 'text-slate-400'
                }`} />
                <p className="font-semibold">Available</p>
              </button>

              <button
                onClick={() => setStatus('occupied')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  status === 'occupied'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-slate-200 hover:border-amber-300 text-slate-600'
                }`}
              >
                <Clock className={`w-8 h-8 mx-auto mb-2 ${
                  status === 'occupied' ? 'text-amber-500' : 'text-slate-400'
                }`} />
                <p className="font-semibold">Occupied</p>
              </button>

              <button
                onClick={() => setStatus('unavailable')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  status === 'unavailable'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 hover:border-red-300 text-slate-600'
                }`}
              >
                <XCircle className={`w-8 h-8 mx-auto mb-2 ${
                  status === 'unavailable' ? 'text-red-500' : 'text-slate-400'
                }`} />
                <p className="font-semibold">Unavailable</p>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason {status !== 'available' && <span className="text-slate-400">(optional)</span>}
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    status === 'occupied'
                      ? 'e.g., Lecture in progress'
                      : status === 'unavailable'
                      ? 'e.g., Maintenance, Equipment issue'
                      : ''
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {status !== 'available' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estimated Duration (minutes) <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 60"
                    min="0"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleStatusUpdate}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>

            {message && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center">
                {message}
              </div>
            )}

            {classroom.estimatedAvailableAt && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Expected available at:</span>{' '}
                  {new Date(classroom.estimatedAvailableAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
              Last updated: {new Date(classroom.lastUpdatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
