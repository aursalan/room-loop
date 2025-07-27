import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Import Routes, Route, Navigate
import { useAuth } from './context/AuthContext';
import './App.css';

// --- Import authentication forms ---
import LoginForm from './components/auth/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';

// --- Import dashboard ---
import Dashboard from './pages/Dashboard'; 

import RoomPage from './pages/RoomPage'; // --- Import RoomPage

import ExplorePage from './pages/ExplorePage';

import {Navbar,NavbarBrand, Button} from "@heroui/react";

// --- ProtectedRoute Component ---
function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoadingAuth } = useAuth();

  if (isLoadingAuth) { // Show loading state if auth check is in progress
    return <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '1.5em' }}>Loading authentication...</div>;
  }
  if (!isLoggedIn) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }
  return children; // Render the child components if authenticated
}
// ------------------------------------

// --- App Component (main application logic) ---
function App() {
  const { isLoggedIn, user, logout, token, isLoadingAuth } = useAuth(); // Keeping these for the header display

  // --- NEW LOG: App Component Render Trace ---
  console.log('App: Component Rendered/Re-rendered. Auth State:', { user: user?.username, token: token ? 'present' : 'null', isLoggedIn, isLoadingAuth });
  // -------------------------------------------

  return (
    <div className="App">
      {/* Header remains, displaying login status */}
      <Navbar style={{ padding: '20px', borderBottom: '1px solid #eee', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <NavbarBrand><p className="font-bold text-inherit">roomloop</p></NavbarBrand>
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>Logged in as <strong>{user?.username}</strong></span>
            <Button onPress={logout} color="danger" radius="lg" variant="shadow">Logout</Button>
          </div>
        ) : (
          <span>Not Logged In</span>
        )}
      </Navbar>

      <main>
        <Routes> {/* --- Define routes here --- */}
          {/* Public routes */}
          <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginForm />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <RegistrationForm />} />

          {/* Protected routes */}
          {/* Default path '/' can be either login (if not logged in) or dashboard (if logged in) */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> {/* Protecting root path */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> {/* Explicit dashboard path */}

          <Route path="/room/:accessCode" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />

          <Route path="explore" element={<ExplorePage />} />

          {/* Catch-all for 404 (optional but good practice) */}
          <Route path="*" element={<h2 style={{textAlign: 'center'}}>404 - Page Not Found</h2>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;