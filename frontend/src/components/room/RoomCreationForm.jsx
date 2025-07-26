import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRoomStatus } from '../../utils/dateTimeHelpers';
// You might need a date formatting library later, but for now, basic ISO string works
// For proper timezone handling, you might explore libraries like 'date-fns-tz' or 'moment-timezone' later.

function RoomCreationForm() {
  const { token, user } = useAuth(); // Need token for authenticated API call
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('public'); // Default to public
  const [maxParticipants, setMaxParticipants] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');
  const [createdRoom, setCreatedRoom] = useState(null); // State for the created room

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setCreatedRoom(null); // Clear previous room display

    if (!token) {
      setMessage('You must be logged in to create a room.');
      return;
    }

    // Basic client-side validation
    if (!name || !startTime || !endTime) {
      setMessage('Name, Start Time, and End Time are required.');
      return;
    }
    if (new Date(startTime) < new Date()) {
        setMessage('Start Time cannot be in the past.');
        return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      setMessage('End Time must be after Start Time.');
      return;
    }

    try {
      const roomData = {
        name,
        topic,
        description,
        type,
        max_participants: maxParticipants ? parseInt(maxParticipants, 10) : null,
        // Convert local datetime-local string to ISO string for backend
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      };

      const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send the JWT
        },
        body: JSON.stringify(roomData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Room "${data.room.name}" created successfully! Access Code: ${data.room.access_code || 'N/A'}`);
        setCreatedRoom(data.room); // --- Store the created room data ---
        // Clear form
        setName('');
        setTopic('');
        setDescription('');
        setType('public');
        setMaxParticipants('');
        setStartTime('');
        setEndTime('');
        // You might redirect to a room details page here
        console.log('Room Creation Success:', data.room);
      } else {
        setMessage(`Failed to create room: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      setMessage('Network error or server unreachable. Please try again.');
    }
  };

  // Helper to format date for datetime-local input (YYYY-MM-DDTHH:MM)
  const formatDateTimeLocal = (date) => {
    if (!date) return '';
    const dt = new Date(date);
    dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset()); // Adjust for local timezone offset
    return dt.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2>Create a New Room</h2>
      {user && <p style={{ textAlign: 'center', color: '#555' }}>Logged in as: {user.username}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Room Name <span style={{color:'red'}}>*</span>:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="topic" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Topic:</label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
          ></textarea>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Room Type <span style={{color:'red'}}>*</span>:</label>
          <input
            type="radio"
            id="public"
            name="roomType"
            value="public"
            checked={type === 'public'}
            onChange={(e) => setType(e.target.value)}
            style={{ marginRight: '5px' }}
          />
          <label htmlFor="public" style={{ marginRight: '15px' }}>Public</label>
          <input
            type="radio"
            id="private"
            name="roomType"
            value="private"
            checked={type === 'private'}
            onChange={(e) => setType(e.target.value)}
            style={{ marginRight: '5px' }}
          />
          <label htmlFor="private">Private</label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="maxParticipants" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Max Participants (optional):</label>
          <input
            type="number"
            id="maxParticipants"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            min="1"
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="startTime" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Start Time <span style={{color:'red'}}>*</span>:</label>
          <input
            type="datetime-local"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="endTime" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>End Time <span style={{color:'red'}}>*</span>:</label>
          <input
            type="datetime-local"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white',
            border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1em'
          }}
        >
          Create Room
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', padding: '10px', borderRadius: '5px', backgroundColor: message.includes('successful') ? '#d4edda' : '#f8d7da', color: message.includes('successful') ? '#155724' : '#721c24', border: message.includes('successful') ? '1px solid #c3e6cb' : '1px solid #f5c6cb' }}>{message}</p>}

       {/* --- Display Created Room Status --- */}
       {createdRoom && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#e7f0ff' }}>
          <h3>Newly Created Room: {createdRoom.name}</h3>
          <p>Topic: {createdRoom.topic || 'N/A'}</p>
          <p>Type: {createdRoom.type}</p>
          {createdRoom.type === 'private' && <p>Access Code: <strong>{createdRoom.access_code}</strong></p>}
          <p>Start: {new Date(createdRoom.start_time).toLocaleString()}</p>
          <p>End: {new Date(createdRoom.end_time).toLocaleString()}</p>
          <p>
            Status: <span style={{
              fontWeight: 'bold',
              color: getRoomStatus(createdRoom.start_time, createdRoom.end_time) === 'live' ? 'green' :
                     getRoomStatus(createdRoom.start_time, createdRoom.end_time) === 'scheduled' ? 'orange' : 'red'
            }}>
              {getRoomStatus(createdRoom.start_time, createdRoom.end_time).toUpperCase()}
            </span>
          </p>
        </div>
      )}
      {/* ------------------------------------------- */}
    </div>
  );
}

export default RoomCreationForm;