import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user data (id, username, email)
  const [token, setToken] = useState(null); // Stores the JWT
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Derived state

  // Function to initialize state from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  // Function to handle login (called by LoginForm)
  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('token', newToken); // Persist to localStorage
    localStorage.setItem('user', JSON.stringify(newUser)); // Persist to localStorage
  };

  // Function to handle logout (called by a logout button)
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token'); // Clear from localStorage
    localStorage.removeItem('user'); // Clear from localStorage
  };

  // The value provided to consuming components
  const authContextValue = {
    user,
    token,
    isLoggedIn,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create a Custom Hook for easier consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};