// frontend/src/pages/ExplorePage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // To get the token
import { getRoomStatus, formatDisplayTime } from '../utils/dateTimeHelpers'; // For status and time display

function ExplorePage() {
  const { token, isLoggedIn } = useAuth(); // Need token for API call
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicRooms = async () => {
      if (!token) { // Ensure token is available before fetching
        setLoading(false);
        setError("Authentication token missing. Please log in.");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/rooms/public', { // Call your backend API
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Send JWT
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch public rooms.');
        }

        const data = await response.json();
        setRooms(data); // Set the array of rooms
        setLoading(false);

      } catch (err) {
        console.error('Error fetching public rooms:', err);
        setError(err.message || 'Could not load public rooms. Please try again.');
        setLoading(false);
      }
    };

    if (isLoggedIn && token) { // Only fetch if user is logged in
      fetchPublicRooms();
    } else {
      setLoading(false); // If not logged in, no rooms to load
    }
  }, [token, isLoggedIn]); // Re-fetch if token or login status changes

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading public rooms...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#0056b3', marginBottom: '30px' }}>Explore Live Public Rooms</h2>
      {rooms.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {rooms.map(room => (
            <div key={room.id} style={{
              border: '1px solid #eee', borderRadius: '8px', padding: '15px',
              boxShadow: '0 1px 5px rgba(0,0,0,0.08)', backgroundColor: '#fff'
            }}>
              <h3 style={{ color: '#333', marginBottom: '5px' }}>{room.name}</h3>
              <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>Topic: {room.topic || 'N/A'}</p>
              <p style={{ fontSize: '0.85em', color: '#888' }}>Host: {room.host_username}</p>
              <p style={{ fontSize: '0.85em', color: '#888' }}>Participants: {room.current_active_participants} {room.max_participants ? ` / ${room.max_participants}` : ''}</p>
              <p style={{ fontSize: '0.85em', color: '#888' }}>Status: <span style={{
                  fontWeight: 'bold',
                  color: getRoomStatus(room.start_time, room.end_time) === 'live' ? '#28a745' :
                         getRoomStatus(room.start_time, room.end_time) === 'scheduled' ? '#ffc107' : '#dc3545'
                }}>
                {getRoomStatus(room.start_time, room.end_time).toUpperCase()}
              </span></p>
              <p style={{ fontSize: '0.85em', color: '#888' }}>Starts: {formatDisplayTime(room.start_time)}</p>
              <p style={{ fontSize: '0.85em', color: '#888' }}>Ends: {formatDisplayTime(room.end_time)}</p>
              {/* You could add a button to join this room here later */}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', fontSize: '1.1em', color: '#888' }}>No live public rooms found at the moment.</p>
      )}
    </div>
  );
}

export default ExplorePage;