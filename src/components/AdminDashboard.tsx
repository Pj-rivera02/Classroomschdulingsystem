import { useState, useEffect } from 'react';
import {
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Edit2,
  X,
  History,
  Plus,
} from 'lucide-react';
import { Classroom, ClassroomStatus, ClassroomLog } from '../types';
import { dataService } from '../services/dataService';

export function AdminDashboard() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState<Classroom[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClassroomStatus | 'all'>('all');
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [viewingLogs, setViewingLogs] = useState<string | null>(null);
  const [logs, setLogs] = useState<ClassroomLog[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const loadClassrooms = () => {
      const rooms = dataService.getClassrooms();
      setClassrooms(rooms);
    };

    loadClassrooms();
    const unsubscribe = dataService.subscribe(loadClassrooms);
    return unsubscribe;
  }, []);

  useEffect(() => {
    filterClassrooms(classrooms, searchTerm, statusFilter);
  }, [searchTerm, statusFilter, classrooms]);

  const filterClassrooms = (
    rooms: Classroom[],
    search: string,
    status: ClassroomStatus | 'all'
  ) => {
    let filtered = rooms;

    if (search) {
      filtered = filtered.filter(
        (room) =>
          room.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
          room.building.toLowerCase().includes(search.toLowerCase()) ||
          room.department.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter((room) => room.status === status);
    }

    setFilteredClassrooms(filtered);
  };

  const getStatusColor = (status: ClassroomStatus) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'occupied':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'unavailable':
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const getStatusIcon = (status: ClassroomStatus) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-5 h-5" />;
      case 'occupied':
        return <Clock className="w-5 h-5" />;
      case 'unavailable':
        return <XCircle className="w-5 h-5" />;
    }
  };

  const handleViewLogs = (classroomId: string) => {
    const classroomLogs = dataService.getLogs(classroomId);
    setLogs(classroomLogs);
    setViewingLogs(classroomId);
  };

  const statusCounts = {
    available: classrooms.filter((c) => c.status === 'available').length,
    occupied: classrooms.filter((c) => c.status === 'occupied').length,
    unavailable: classrooms.filter((c) => c.status === 'unavailable').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
              <p className="text-slate-600">Centralized classroom management</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Classroom
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700 font-medium">Available</p>
                  <p className="text-2xl font-bold text-emerald-900">{statusCounts.available}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-amber-700 font-medium">Occupied</p>
                  <p className="text-2xl font-bold text-amber-900">{statusCounts.occupied}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500 rounded-lg">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-red-700 font-medium">Unavailable</p>
                  <p className="text-2xl font-bold text-red-900">{statusCounts.unavailable}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by room number, building, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ClassroomStatus | 'all')}
                className="pl-10 pr-8 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white cursor-pointer min-w-[180px]"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredClassrooms.map((classroom) => (
            <div
              key={classroom.id}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-slate-400" />
                      <h3 className="text-xl font-semibold text-slate-900">
                        Room {classroom.roomNumber}
                      </h3>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(
                        classroom.status
                      )}`}
                    >
                      {getStatusIcon(classroom.status)}
                      <span className="text-sm font-medium capitalize">{classroom.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-slate-500">Building</p>
                      <p className="text-slate-900 font-medium">{classroom.building || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Department</p>
                      <p className="text-slate-900 font-medium">{classroom.department || 'N/A'}</p>
                    </div>
                  </div>

                  {classroom.reason && (
                    <div className="mb-3">
                      <p className="text-sm text-slate-500">Reason</p>
                      <p className="text-slate-900">{classroom.reason}</p>
                    </div>
                  )}

                  {classroom.estimatedAvailableAt && (
                    <div className="mb-3">
                      <p className="text-sm text-slate-500">Expected Available At</p>
                      <p className="text-slate-900 font-medium">
                        {new Date(classroom.estimatedAvailableAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-slate-500">
                    Last updated: {new Date(classroom.lastUpdatedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewLogs(classroom.id)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="View history"
                  >
                    <History className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEditingClassroom(classroom)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredClassrooms.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No classrooms found</p>
            </div>
          )}
        </div>
      </div>

      {editingClassroom && (
        <EditModal
          classroom={editingClassroom}
          onClose={() => setEditingClassroom(null)}
        />
      )}

      {viewingLogs && (
        <LogsModal
          classroomId={viewingLogs}
          logs={logs}
          onClose={() => setViewingLogs(null)}
        />
      )}

      {showAddModal && (
        <AddClassroomModal
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function EditModal({ classroom, onClose }: { classroom: Classroom; onClose: () => void }) {
  const [status, setStatus] = useState<ClassroomStatus>(classroom.status);
  const [reason, setReason] = useState(classroom.reason);
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const estimatedAvailableAt = duration
      ? new Date(Date.now() + parseInt(duration) * 60000).toISOString()
      : null;

    dataService.updateClassroom(
      classroom.id,
      {
        status,
        reason,
        estimatedAvailableAt,
      },
      'admin'
    );

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Edit Room {classroom.roomNumber}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <div className="grid grid-cols-3 gap-3">
              {(['available', 'occupied', 'unavailable'] as ClassroomStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium capitalize ${
                    status === s
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {status !== 'available' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LogsModal({
  classroomId,
  logs,
  onClose,
}: {
  classroomId: string;
  logs: ClassroomLog[];
  onClose: () => void;
}) {
  const classroom = dataService.getClassroom(classroomId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            History - Room {classroom?.roomNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {logs.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No history available</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {log.previousStatus && (
                        <>
                          <span className="text-sm font-medium text-slate-600 capitalize">
                            {log.previousStatus}
                          </span>
                          <span className="text-slate-400">→</span>
                        </>
                      )}
                      <span className="text-sm font-medium text-slate-900 capitalize">
                        {log.newStatus}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 px-2 py-1 bg-slate-100 rounded">
                      {log.updatedByRole}
                    </span>
                  </div>
                  {log.reason && (
                    <p className="text-sm text-slate-700 mb-2">Reason: {log.reason}</p>
                  )}
                  {log.notes && <p className="text-sm text-slate-600 mb-2">{log.notes}</p>}
                  <p className="text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddClassroomModal({ onClose }: { onClose: () => void }) {
  const [roomNumber, setRoomNumber] = useState('');
  const [building, setBuilding] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber) return;

    setLoading(true);
    dataService.createClassroom({
      roomNumber,
      building,
      department,
      status: 'available',
      reason: '',
      estimatedAvailableAt: null,
      lastUpdatedBy: null,
    });

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Add New Classroom</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Room Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Building</label>
            <input
              type="text"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !roomNumber}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300"
            >
              {loading ? 'Adding...' : 'Add Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
