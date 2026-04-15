export type ClassroomStatus = 'available' | 'occupied' | 'unavailable';
export type UserRole = 'admin' | 'classroom';

export interface Classroom {
  id: string;
  roomNumber: string;
  building: string;
  department: string;
  status: ClassroomStatus;
  reason: string;
  estimatedAvailableAt: string | null;
  lastUpdatedBy: string | null;
  lastUpdatedAt: string;
  createdAt: string;
}

export interface ClassroomLog {
  id: string;
  classroomId: string;
  previousStatus: ClassroomStatus | null;
  newStatus: ClassroomStatus;
  reason: string;
  estimatedAvailableAt: string | null;
  updatedBy: string | null;
  updatedByRole: UserRole;
  notes: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  assignedClassroomId: string | null;
  createdAt: string;
  updatedAt: string;
}
