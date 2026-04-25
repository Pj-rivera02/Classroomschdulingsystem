import { Classroom, ClassroomLog, User, UserRole } from '../types';

type Listener = () => void;

class DataService {
  private classrooms: Map<string, Classroom> = new Map();
  private logs: ClassroomLog[] = [];
  private users: Map<string, User> = new Map();
  private listeners: Set<Listener> = new Set();
  private currentUser: User | null = null;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const now = new Date().toISOString();

    const mockClassrooms: Classroom[] = [
      {
        id: '1',
        roomNumber: '101',
        building: 'Building A',
        department: 'Computer Science',
        status: 'available',
        reason: '',
        estimatedAvailableAt: null,
        lastUpdatedBy: null,
        lastUpdatedAt: now,
        createdAt: now,
      },
      {
        id: '2',
        roomNumber: '102',
        building: 'Building A',
        department: 'Computer Science',
        status: 'occupied',
        reason: 'Lecture in progress',
        estimatedAvailableAt: new Date(Date.now() + 3600000).toISOString(),
        lastUpdatedBy: null,
        lastUpdatedAt: now,
        createdAt: now,
      },
      {
        id: '3',
        roomNumber: '203',
        building: 'Building B',
        department: 'Mathematics',
        status: 'unavailable',
        reason: 'Projector maintenance',
        estimatedAvailableAt: new Date(Date.now() + 7200000).toISOString(),
        lastUpdatedBy: null,
        lastUpdatedAt: now,
        createdAt: now,
      },
      {
        id: '4',
        roomNumber: '204',
        building: 'Building B',
        department: 'Mathematics',
        status: 'available',
        reason: '',
        estimatedAvailableAt: null,
        lastUpdatedBy: null,
        lastUpdatedAt: now,
        createdAt: now,
      },
      {
        id: '5',
        roomNumber: '305',
        building: 'Building C',
        department: 'Physics',
        status: 'occupied',
        reason: 'Lab session',
        estimatedAvailableAt: new Date(Date.now() + 5400000).toISOString(),
        lastUpdatedBy: null,
        lastUpdatedAt: now,
        createdAt: now,
      },
      {
        id: '6',
        roomNumber: '306',
        building: 'Building C',
        department: 'Physics',
        status: 'available',
        reason: '',
        estimatedAvailableAt: null,
        lastUpdatedBy: null,
        lastUpdatedAt: now,
        createdAt: now,
      },
    ];

    mockClassrooms.forEach(classroom => {
      this.classrooms.set(classroom.id, classroom);
    });

    const adminUser: User = {
      id: 'admin-1',
      email: 'admin@school.edu',
      fullName: 'Admin User',
      role: 'admin',
      assignedClassroomId: null,
      createdAt: now,
      updatedAt: now,
    };

    const classroomUser: User = {
      id: 'classroom-1',
      email: 'room101@school.edu',
      fullName: 'Room 101',
      role: 'classroom',
      assignedClassroomId: '1',
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(classroomUser.id, classroomUser);
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  getClassrooms(): Classroom[] {
    return Array.from(this.classrooms.values()).sort((a, b) =>
      a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
    );
  }

  getClassroom(id: string): Classroom | undefined {
    return this.classrooms.get(id);
  }

  getClassroomByRoomNumber(roomNumber: string): Classroom | undefined {
    return Array.from(this.classrooms.values()).find(
      c => c.roomNumber === roomNumber
    );
  }

  updateClassroom(
    id: string,
    updates: Partial<Classroom>,
    updatedByRole: UserRole = 'classroom'
  ): Classroom | null {
    const classroom = this.classrooms.get(id);
    if (!classroom) return null;

    const previousStatus = classroom.status;
    const now = new Date().toISOString();

    const updatedClassroom: Classroom = {
      ...classroom,
      ...updates,
      lastUpdatedBy: this.currentUser?.id || null,
      lastUpdatedAt: now,
    };

    this.classrooms.set(id, updatedClassroom);

    const log: ClassroomLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      classroomId: id,
      previousStatus: previousStatus,
      newStatus: updatedClassroom.status,
      reason: updatedClassroom.reason,
      estimatedAvailableAt: updatedClassroom.estimatedAvailableAt,
      updatedBy: this.currentUser?.id || null,
      updatedByRole: updatedByRole,
      notes: previousStatus !== updatedClassroom.status
        ? `Status changed from ${previousStatus} to ${updatedClassroom.status}`
        : 'Details updated',
      createdAt: now,
    };

    this.logs.unshift(log);
    this.notifyListeners();

    return updatedClassroom;
  }

  createClassroom(classroom: Omit<Classroom, 'id' | 'createdAt' | 'lastUpdatedAt'>): Classroom {
    const now = new Date().toISOString();
    const newClassroom: Classroom = {
      ...classroom,
      id: `classroom-${Date.now()}-${Math.random()}`,
      createdAt: now,
      lastUpdatedAt: now,
    };

    this.classrooms.set(newClassroom.id, newClassroom);
    this.notifyListeners();

    return newClassroom;
  }

  deleteClassroom(id: string): boolean {
    const deleted = this.classrooms.delete(id);
    if (deleted) {
      this.logs = this.logs.filter(log => log.classroomId !== id);
      this.notifyListeners();
    }
    return deleted;
  }

  getLogs(classroomId?: string): ClassroomLog[] {
    if (classroomId) {
      return this.logs.filter(log => log.classroomId === classroomId);
    }
    return this.logs;
  }

  setCurrentUser(userId: string | null) {
    if (userId === null) {
      this.currentUser = null;
    } else {
      this.currentUser = this.users.get(userId) || null;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  login(email: string): User | null {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (user) {
      this.setCurrentUser(user.id);
      return user;
    }
    return null;
  }

  logout() {
    this.setCurrentUser(null);
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  canUpdateClassroom(classroomId: string): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'admin') return true;
    return this.currentUser.assignedClassroomId === classroomId;
  }
}

export const dataService = new DataService();
