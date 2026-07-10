import React, { createContext, useContext, useState, useEffect } from 'react';
import { volunteerService } from '../services/api';

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
    // In a real app, this would be an API call
    // For this hackathon, we'll store in localStorage
    const users = JSON.parse(localStorage.getItem('sevasync_registered_users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('User already exists');
    }

    // Admins signup with 'pending' status, Volunteers with 'approved'
    const newUser = { 
      ...userData, 
      id: Date.now().toString(),
      status: userData.role === 'admin' ? 'pending' : 'approved'
    };

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
        throw new Error('BACKEND SYNC FAILED: Make sure the Python backend is active.');
      }
    }

    users.push(newUser);
    localStorage.setItem('sevasync_registered_users', JSON.stringify(users));
    return newUser;
  };


  const login = (email, password) => {
    console.log('Attempting login for:', email);
    // Add demo accounts (pre-approved)
    const demoAccounts = [
      { email: 'volunteer@sevasync.com', password: 'demo123', name: 'Demo Volunteer', role: 'Volunteer', status: 'approved' },
      { email: 'admin@sevasync.com', password: 'admin123', name: 'System Admin', role: 'admin', status: 'approved' }
    ];

    const users = JSON.parse(localStorage.getItem('sevasync_registered_users') || '[]');
    const allUsers = [...demoAccounts, ...users];
    
    const foundUser = allUsers.find(u => u.email === (email || '').toLowerCase() && u.password === password);

    if (foundUser) {
      // Check if admin is pending approval
      if (foundUser.role === 'admin' && foundUser.status === 'pending') {
        console.error('Login failed: Admin status is pending approval');
        throw new Error('ACCESS PENDING: Your admin registration is awaiting commander approval.');
      }

      console.log('Login successful:', foundUser.role);
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('sevasync_user', JSON.stringify(userWithoutPassword));
      return userWithoutPassword;
    } else {
      console.error('Login failed: Invalid credentials');
      throw new Error('Invalid email or password');
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
