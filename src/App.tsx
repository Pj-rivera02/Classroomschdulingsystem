import { useState, useEffect } from 'react';
import { LoginInterface } from './components/LoginInterface';
import { ClassroomInterface } from './components/ClassroomInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { dataService } from './services/dataService';
import { User } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = dataService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    const user = dataService.getCurrentUser();
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    dataService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginInterface onLogin={handleLogin} />;
  }

  if (currentUser?.role === 'admin') {
    return (
      <div>
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
          <div>
            <span className="text-sm text-slate-400">Logged in as:</span>
            <span className="ml-2 font-semibold">{currentUser.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  const classroom = currentUser?.assignedClassroomId
    ? dataService.getClassroom(currentUser.assignedClassroomId)
    : null;

  if (!classroom) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600 mb-4">No classroom assigned</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleLogout}
          className="text-sm bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Exit
        </button>
      </div>
      <ClassroomInterface roomNumber={classroom.roomNumber} />
    </div>
  );
}

export default App;
