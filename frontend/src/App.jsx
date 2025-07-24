import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Import Routes, Route, Navigate
import { useAuth } from './context/AuthContext';
import './App.css';

import { io } from 'socket.io-client'; // Import io from socket.io-client


// --- Import authentication forms ---
import LoginForm from './components/Auth/LoginForm';
import RegistrationForm from './components/Auth/RegistrationForm';

// --- Import dashboard ---
import Dashboard from './pages/Dashboard'; 

// --- ProtectedRoute Component ---
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }
  return children; // Render the child components if authenticated
}
// ------------------------------------

// --- App Component (main application logic) ---
function App() {
  const { isLoggedIn, user, logout } = useAuth(); // Keeping these for the header display

  // --- Socket.IO Client Connection Logic ---
  useEffect(() => {
    // Connect to your backend's Socket.IO server
    const socket = io('http://localhost:3001'); // Replace with your backend URL

    // Listen for connection events
    socket.on('connect', () => {
      console.log('Socket.IO Connected! Client ID:', socket.id);
      // You might send an authentication event here later if required by backend
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO Disconnected!');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO Connection Error:', err.message);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      if (socket.connected) {
        socket.disconnect();
        console.log('Socket.IO client cleaned up.');
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // -----------------------------------------------

  return (
    <div className="App">
      {/* Header remains, displaying login status */}
      <header style={{ padding: '20px', borderBottom: '1px solid #eee', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Roomloop</h1>
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>Logged in as <strong>{user?.username}</strong></span>
            <button onClick={logout} style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
          </div>
        ) : (
          <span>Not Logged In</span>
        )}
      </header>

      <main>
        <Routes> {/* --- Define routes here --- */}
          {/* Public routes */}
          <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginForm />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <RegistrationForm />} />

          {/* Protected routes */}
          {/* Default path '/' can be either login (if not logged in) or dashboard (if logged in) */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> {/* Protecting root path */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> {/* Explicit dashboard path */}

          {/* Catch-all for 404 (optional but good practice) */}
          <Route path="*" element={<h2 style={{textAlign: 'center'}}>404 - Page Not Found</h2>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;