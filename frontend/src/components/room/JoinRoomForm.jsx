// frontend/src/components/Room/JoinRoomForm.jsx

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function JoinRoomForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [accessCode, setAccessCode] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!accessCode) {
      setMessage('Access Code is required to join a room.');
      return;
    }

    // --- Core Logic: Simply navigate to the RoomPage URL ---
    // The RoomPage will then handle the API call and display.
    navigate(`/room/${accessCode}`);
    setAccessCode(''); // Clear input
    setMessage('Attempting to join room...'); // Provide immediate feedback
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Join a Room</h2>
      {user && <p style={{ textAlign: 'center', color: '#555' }}>Logged in as: {user.username}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="accessCode" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Room Access Code:</label>
          <input
            type="text"
            id="accessCode"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}
        >
          Join Room
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', color: message.includes('required') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
} // <<< --- THIS IS THE MISSING CURLY BRACE YOU NEED TO ADD --- <<<

export default JoinRoomForm;