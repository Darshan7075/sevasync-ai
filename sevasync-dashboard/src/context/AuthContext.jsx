import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('sevasync_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signup = (userData) => {
    // In a real app, this would be an API call
    // For this hackathon, we'll store in localStorage
    const users = JSON.parse(localStorage.getItem('sevasync_registered_users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('User already exists');
    }

    const newUser = { ...userData, id: Date.now().toString() };
    users.push(newUser);
    localStorage.setItem('sevasync_registered_users', JSON.stringify(users));
    return newUser;
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('sevasync_registered_users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('sevasync_user', JSON.stringify(userWithoutPassword));
      return userWithoutPassword;
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sevasync_user');
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, loading }}>
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
