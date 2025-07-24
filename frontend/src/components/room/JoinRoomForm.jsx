import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// You might import useNavigate from 'react-router-dom' later for redirection

function JoinRoomForm() {
  const { token, user } = useAuth(); // Need token for authenticated API call
  const [accessCode, setAccessCode] = useState('');
  const [message, setMessage] = useState('');
  const [joinedRoomDetails, setJoinedRoomDetails] = useState(null); // To show details of joined room

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    setJoinedRoomDetails(null); // Clear previous joined room display

    if (!token) {
      setMessage('You must be logged in to join a room.');
      return;
    }
    if (!accessCode) {
      setMessage('Access Code is required to join a room.');
      return;
    }

    try {
      // Construct the URL with the accessCode in the path
      const response = await fetch(`/api/rooms/${accessCode}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send the JWT
        },
        // Note: Body is empty as accessCode is in URL params for this simplified API
        body: JSON.stringify({}), // Send an empty object if your backend expects a body
      });

      const data = await response.json(); // Parse the JSON response

      if (response.ok) { // Check if the response status is 2xx
        setMessage(`Successfully joined room "${data.room.name}"!`);
        setJoinedRoomDetails(data.room); // Store joined room details
        setAccessCode(''); // Clear input on success
        // You might redirect the user to a specific room page here later
        console.log('Room Join Success:', data.room);
      } else {
        setMessage(`Failed to join room: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      setMessage('Network error or server unreachable. Please try again.');
    }
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
      {message && <p style={{ marginTop: '15px', color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}

      {/* --- Display Joined Room Details --- */}
      {joinedRoomDetails && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #28a745', borderRadius: '8px', backgroundColor: '#e6ffe6' }}>
          <h3>Joined Room: {joinedRoomDetails.name}</h3>
          <p>Topic: {joinedRoomDetails.topic || 'N/A'}</p>
          <p>Current Participants: <strong>{joinedRoomDetails.current_participants}</strong></p>
          <p>Status: {joinedRoomDetails.status.toUpperCase()}</p>
          {/* More details could be added here */}
        </div>
      )}
      {/* ---------------------------------------- */}
    </div>
  );
}

export default JoinRoomForm;