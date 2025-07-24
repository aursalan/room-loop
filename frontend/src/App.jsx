import React from 'react';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <div className="App">
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

      <main style={{ textAlign: 'center', marginTop: '50px' }}>
        {/* This area will be used by your router to render different pages */}
        {isLoggedIn ? (
          <p style={{ fontSize: '1.2em' }}>Welcome back, {user?.username}! Explore rooms or create your own.</p>
        ) : (
          <p style={{ fontSize: '1.2em' }}>Please login or register to continue.</p>
        )}
      </main>
    </div>
  );
}

export default App;