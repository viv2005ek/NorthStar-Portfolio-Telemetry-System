import { useState } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { getCurrentUser, getAuthToken, User } from './services/api';

export function App() {
  const [user, setUser] = useState<User | null>(() => {
    const token = getAuthToken();
    const currentUser = getCurrentUser();
    return token && currentUser ? currentUser : null;
  });

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;
