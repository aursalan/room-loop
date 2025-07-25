import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user data (id, username, email)
  const [token, setToken] = useState(null); // Stores the JWT
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Derived state
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Loading auth status

  // --- NEW LOGS: Trace rehydration ---
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    console.log('AuthContext: useEffect (rehydration) triggered.');
    console.log('AuthContext: localStorage - storedToken:', storedToken ? 'present' : 'null');
    console.log('AuthContext: localStorage - storedUser:', storedUser ? 'present' : 'null');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setIsLoggedIn(true);
        console.log('AuthContext: Rehydrated from localStorage. User:', parsedUser.username, 'Token:', storedToken.substring(0, 10) + '...');
      } catch (error) {
        console.error('AuthContext: Failed to parse user from localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null); setToken(null); setIsLoggedIn(false); // Ensure state is reset on parse error
        console.log('AuthContext: Cleared corrupted localStorage data.');
      }
    } else {
        console.log('AuthContext: No token/user found in localStorage, user is logged out.');
        setUser(null); setToken(null); setIsLoggedIn(false); // Ensure state is consistently null/false
    }
    setIsLoadingAuth(false);
    console.log('AuthContext: Finished rehydration. isLoadingAuth set to false.');
  }, []);
  // ------------------------------------

  // --- NEW LOGS: Trace login/logout ---
  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setIsLoadingAuth(false);
    console.log('AuthContext: LOGIN successful. User:', newUser.username, 'Token:', newToken.substring(0, 10) + '...');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('AuthContext: LOGOUT successful. States cleared.');
  };
  // ------------------------------------

  // The value provided to consuming components
  const authContextValue = {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    isLoadingAuth, 
  };

  // --- NEW LOG: Trace context value on each render ---
  console.log('AuthContext: Provider rendering. Current context value:', { user: user?.username, token: token ? 'present' : 'null', isLoggedIn, isLoadingAuth });
  // --------------------------------------------------

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