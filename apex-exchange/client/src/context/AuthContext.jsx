import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { socket } from '../lib/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('apex_token');
    const storedUser = localStorage.getItem('apex_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        socket.connect();
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('apex_token');
        localStorage.removeItem('apex_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/api/auth/login', { username, password });
      const { token: newToken, user: newUser } = res.data;

      setToken(newToken);
      setUser(newUser);

      localStorage.setItem('apex_token', newToken);
      localStorage.setItem('apex_user', JSON.stringify(newUser));

      socket.connect();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      return { success: false, error: msg };
    }
  };

  const register = async (username, email, password) => {
    try {
      await api.post('/api/auth/register', { username, email, password });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('apex_token');
    localStorage.removeItem('apex_user');
    setToken(null);
    setUser(null);
    socket.disconnect();
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
