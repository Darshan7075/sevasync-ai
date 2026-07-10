import React, { createContext, useContext, useState, useEffect } from 'react';
import { volunteerService, userService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('sevasync_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Auto-login is allowed ONLY for admins
      if (parsedUser.role === 'admin') {
        setUser(parsedUser);
      } else {
        // Automatically clear other roles (like Volunteers) on reload
        localStorage.removeItem('sevasync_user');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const signup = async (userData) => {
    try {
      // Create user in SQLAlchemy backend
      const response = await userService.signup(userData);
      const newUser = response.data;

      // If registering as a Volunteer, sync with backend database
      if (userData.role === 'Volunteer') {
        try {
          await volunteerService.create({
            name: userData.name,
            skill: 'Field Agent',
            location: 'Vadodara',
            availability: 'Active',
            contact: userData.email,
            rating: 5.0
          });
        } catch (err) {
          console.error("Failed to sync volunteer to SQLite backend:", err);
        }
      }

      return newUser;
    } catch (err) {
      console.error("Signup failed:", err);
      const errMsg = err.response?.data?.detail || err.message || 'Registration failed';
      throw new Error(errMsg);
    }
  };


  const login = async (email, password) => {
    console.log('Attempting login for:', email);
    try {
      const response = await userService.login(email, password);
      const loggedInUser = response.data;
      console.log('Login successful:', loggedInUser.role);
      
      setUser(loggedInUser);
      localStorage.setItem('sevasync_user', JSON.stringify(loggedInUser));
      return loggedInUser;
    } catch (err) {
      console.error('Login failed:', err);
      const errMsg = err.response?.data?.detail || err.message || 'Invalid email or password';
      throw new Error(errMsg);
    }
  };

  const loginAsGuest = () => {
    const guestUser = { id: 'guest', name: 'Demo Judge', email: 'judge@hackathon.com', role: 'admin', status: 'approved' };
    setUser(guestUser);
    localStorage.setItem('sevasync_user', JSON.stringify(guestUser));
    return guestUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sevasync_user');
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, loginAsGuest, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
