// frontend/src/pages/ExplorePage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // To get the token
import { getRoomStatus, formatDisplayTime } from '../utils/dateTimeHelpers'; // For status and time display
import { useNavigate } from 'react-router-dom'; // --- NEW: Import useNavigate

function ExplorePage() {
  const { token, isLoggedIn } = useAuth(); // Need token for API call
  const navigate = useNavigate(); // Initialize useNavigate
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW: Filter states ---
  const [filterTag, setFilterTag] = useState('');
  const [filterStatus, setFilterStatus] = useState('live'); // Default filter status
  // --------------------------

  useEffect(() => {
    const fetchPublicRooms = async () => {
      if (!token) {
        setLoading(false);
        setError("Authentication token missing. Please log in.");
        return;
      }
      try {
        setLoading(true);
        setError(null);

        // --- NEW: Construct URL with filter query parameters ---
        const queryParams = new URLSearchParams();
        if (filterTag) {
          queryParams.append('tag', filterTag);
        }
        if (filterStatus && filterStatus !== 'all') { // Only append if not 'all' or empty
          queryParams.append('status', filterStatus);
        }
        const url = `/api/rooms/public?${queryParams.toString()}`;
        // ----------------------------------------------------

        const response = await fetch(url, { // Use the constructed URL
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch public rooms.');
        }

        const data = await response.json();
        setRooms(data);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching public rooms:', err);
        setError(err.message || 'Could not load public rooms. Please try again.');
        setLoading(false);
      }
    };

    if (isLoggedIn && token) {
      fetchPublicRooms();
    } else {
      setLoading(false);
    }
  }, [token, isLoggedIn, filterTag, filterStatus]); // --- NEW: Add filter states to dependency array ---

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading public rooms...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#0056b3', marginBottom: '30px' }}>Explore Live Public Rooms</h2>
      
      {/* --- NEW: Filter Controls --- */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Tag Filter */}
        <div style={{ flex: '1 1 auto', minWidth: '180px' }}>
          <label htmlFor="filterTag" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Filter by Tag:</label>
          <input
            type="text"
            id="filterTag"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            placeholder="e.g., Social, Work"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ flex: '1 1 auto', minWidth: '180px' }}>
          <label htmlFor="filterStatus" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Filter by Status:</label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white' }}
          >
            <option value="live">Live</option>
            <option value="starting_soon">Starting Soon</option>
            <option value="all">All (Live & Starting Soon)</option> {/* Option to show both */}
          </select>
        </div>

        {/* Clear Filters Button */}
        <div style={{ flex: '0 0 auto', alignSelf: 'flex-end', marginTop: 'auto' }}>
          <button
            onClick={() => {
              setFilterTag('');
              setFilterStatus('live'); // Reset to default filter
            }}
            style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Clear Filters
          </button>
        </div>
      </div>
      {/* ---------------------------- */}


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

              {/* --- NEW: Join Room Button --- */}
              {getRoomStatus(room.start_time, room.end_time) === 'live' && room.access_code ? ( // Only show if live, open, AND has an access_code
                  <button
                    onClick={() => navigate(`/room/${room.access_code}`)} // Navigate to RoomPage with access_code
                    style={{
                      marginTop: '15px', padding: '8px 12px', backgroundColor: '#007bff', color: 'white',
                      border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em', width: '100%'
                    }}
                  >
                    Join Room
                  </button>
                ) : (
                  <p style={{ marginTop: '15px', fontSize: '0.8em', color: '#888' }}>
                    {roomCurrentStatus === 'closed' ? 'Room Closed' :
                     roomCurrentStatus === 'scheduled' ? 'Scheduled' :
                     (room.max_participants && room.current_active_participants >= room.max_participants) ? 'Room Full' : ''}
                  </p>
                )}
                {/* --------------------------- */}
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