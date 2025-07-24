import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams, useNavigate
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getRoomStatus, formatDisplayTime } from '../utils/dateTimeHelpers'; // Adjust path as needed

function RoomPage() {
  const { accessCode } = useParams(); // Get accessCode from URL parameters
  const { token, isLoggedIn, user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate(); // For redirection on error or logout

  const [roomData, setRoomData] = useState(null); // Stores the joined room's data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasFetchedRoom = useRef(false);

  // --- Function to handle joining the room ---
  const joinRoom = async (code, authToken, userId, username) => {
    if (!authToken || !code) {
      setLoading(false);
      setError("Authentication token or room access code missing.");
      navigate('/login', { replace: true }); // Redirect to login if no token
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for specific error messages from backend
        let errorMessage = data.message || 'Failed to join room.';
        if (response.status === 404) errorMessage = 'Room not found with this access code.';
        if (response.status === 403) errorMessage = `Cannot join: ${data.message}`;
        if (response.status === 409) errorMessage = `Conflict: ${data.message}`;

        throw new Error(errorMessage);
      }

      setRoomData(data.room); // Store the full room data returned by join API
      setLoading(false);
      console.log('Successfully joined room via URL:', data.room);

    } catch (err) {
      console.error('Error joining room via URL:', err);
      setError(err.message || 'Could not join room. Please try again.');
      setLoading(false);
    }
  };

  // --- Effect to trigger joinRoom on component mount or token/code change ---
  useEffect(() => {
    // Prevent running twice in StrictMode for API calls that cause side effects like joins/inserts
    if (hasFetchedRoom.current) {
      return; // Skip if already fetched in this mount cycle (due to StrictMode double-render)
    }

    if (isLoggedIn && token && accessCode) {
      joinRoom(accessCode, token, user?.id, user?.username);
      hasFetchedRoom.current = true; // Mark as fetched
    } else if (!isLoggedIn) {
      setLoading(false);
      navigate('/login', { replace: true });
    } else {
      setLoading(false);
      setError("No room access code provided in URL.");
    }

    // Cleanup function (important for StrictMode, though not directly for ref here)
    return () => {
      // If you had any active subscriptions or intervals from *this specific effect*, you'd clean them here.
      // For this specific API call, the ref handles the double-call.
    };
  }, [accessCode, token, isLoggedIn, navigate, user]);

  // --- Effect to listen for real-time updates (similar to JoinRoomForm) ---
  useEffect(() => {
    if (!socket || !roomData) return;

    const handleParticipantUpdate = (data) => {
      if (data.roomId === roomData.id) {
        console.log(`Real-time update for room ${roomData.name}: ${data.newParticipantCount} participants.`);
        setRoomData(prevData => ({
          ...prevData,
          current_participants: data.newParticipantCount,
        }));
        // Optionally, display a transient message about who joined/left
        // setMessage(`Participant update: ${data.username} ${data.action}! New count: ${data.newParticipantCount}`);
      }
    };

    socket.on('room:participant_updated', handleParticipantUpdate);

    return () => {
      socket.off('room:participant_updated', handleParticipantUpdate);
    };
  }, [socket, roomData]);

  // --- Render Logic ---
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading room...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>Error: {error}</div>;
  }

  if (!roomData) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>No room data available. Please check the access code.</div>;
  }

  // Display the room details if data is available
  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '30px', border: '1px solid #007bff', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#0056b3' }}>{roomData.name}</h2>
      <p style={{ fontSize: '1.1em', color: '#333' }}>Topic: <strong>{roomData.topic || 'N/A'}</strong></p>
      <p style={{ color: '#666' }}>{roomData.description || 'No description provided.'}</p>
      <p>Type: <span style={{ fontWeight: 'bold', color: roomData.type === 'public' ? 'green' : 'purple' }}>{roomData.type.toUpperCase()}</span></p>
      {roomData.type === 'private' && roomData.access_code && <p>Access Code: <strong>{roomData.access_code}</strong> (Share this to invite)</p>}
      <p>Participants: <strong>{roomData.current_participants}</strong> {roomData.max_participants ? ` / ${roomData.max_participants}` : ''}</p>
      <p>Status: <span style={{
        fontWeight: 'bold',
        color: getRoomStatus(roomData.start_time, roomData.end_time) === 'live' ? '#28a745' :
               getRoomStatus(roomData.start_time, roomData.end_time) === 'scheduled' ? '#ffc107' : '#dc3545'
      }}>
        {getRoomStatus(roomData.start_time, roomData.end_time).toUpperCase()}
      </span></p>
      <p>Starts: {formatDisplayTime(roomData.start_time)}</p>
      <p>Ends: {formatDisplayTime(roomData.end_time)}</p>
      <hr style={{ margin: '30px auto', width: '80%' }} />
      <p style={{ color: '#888' }}>You are viewing room {accessCode}</p>
      {/* Add more interactive elements later */}
    </div>
  );
}

export default RoomPage;