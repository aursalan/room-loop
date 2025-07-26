import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams, useNavigate
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getRoomStatus, formatDisplayTime } from '../utils/dateTimeHelpers';

function RoomPage() {
  const { accessCode } = useParams(); // Get accessCode from URL parameters
  const { token, isLoggedIn, user, isLoadingAuth } = useAuth(); // Get isLoadingAuth
  const [copyMessage, setCopyMessage] = useState(''); // State for copy confirmation message
  const socket = useSocket();
  const navigate = useNavigate(); // For redirection on error or logout

  const [roomData, setRoomData] = useState(null); // Stores the joined room's data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);

   // --- States for Chat ---
   const [messages, setMessages] = useState([]);
   const [messageInput, setMessageInput] = useState('');
   const chatLogRef = useRef(null); // Ref for scrolling chat log
   // --------------------------

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
      setParticipants(data.room.participants || []);
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

    // If auth state is still loading, WAIT. Don't make decisions yet.
    if (isLoadingAuth) {
      return; // Exit effect early if auth is still loading
    }

    // Prevent running twice in StrictMode for API calls that cause side effects like joins/inserts
    if (hasFetchedRoom.current) {
      return;
    }

    // Now that auth is loaded (isLoadingAuth is false):
    if (isLoggedIn && token && accessCode) {
      joinRoom(accessCode, token); // user?.id and user?.username were passed to joinRoom before, but not needed in this version
      hasFetchedRoom.current = true; // Mark as fetched
    } else if (!isLoggedIn) { // This condition will now run ONLY AFTER isLoadingAuth is false
      setLoading(false); // Stop loading room
      navigate('/login', { replace: true });
    } else { // This handles cases like missing accessCode in URL (e.g. /room/ typed without a code)
      setLoading(false);
      setError("No room access code provided in URL.");
    }

    return () => {
      // Cleanup for StrictMode for this particular pattern:
      // Reset hasFetchedRoom.current when the component unmounts for development purposes,
      // so that if it remounts (e.g., in StrictMode), it tries to fetch again.
      // hasFetchedRoom.current = false;
      // You could also add specific cleanup for socket listeners if they were defined inside this effect
    };
  }, [accessCode, token, isLoggedIn, navigate, user, isLoadingAuth]); // Add isLoadingAuth dependency


  // --- NEW: Single Consolidated useEffect for ALL Socket.IO Management and Listeners ---
  // This handles:
  // 1. Emitting 'join_room' to backend
  // 2. Listening for 'chat:message_received'
  // 3. Listening for 'room:participant_updated'
  // 4. Proper cleanup for all listeners
  useEffect(() => {
    // --- NEW LOGS (for debugging this useEffect's flow) ---
    console.log('RoomPage useEffect (Socket.IO Consolidated): Triggered.');
    console.log('  Dependencies:', {
        socketReady: !!socket,
        roomDataId: roomData?.id,
        userUsername: user?.username
    });
    // ----------------

    // Ensure socket, roomData (with its ID), and current user's username are available
    if (!socket || !roomData?.id || !user?.username) {
      console.log("RoomPage useEffect (Socket.IO Consolidated): Conditions not met. Skipping Socket.IO setup.");
      return;
    }

    const socketRoomId = roomData.id;
    const currentUserUsername = user.username;

    // 1. Emit 'join_room' event to backend (to subscribe this client's socket to a specific room)
    console.log(`RoomPage useEffect (Socket.IO Consolidated): Emitting 'join_room' for room: ${socketRoomId} for user ${currentUserUsername}`);
    socket.emit('join_room', socketRoomId);

    // 2. Listen for incoming chat messages
    const handleChatMessageReceived = (message) => {
      console.log('RoomPage useEffect (Socket.IO Consolidated): RECEIVED chat message:', message);
      setMessages(prevMessages => [...prevMessages, message]);
    };
    socket.on('chat:message_received', handleChatMessageReceived);

    // 3. Listen for real-time participant updates (moved here from previous separate useEffect)
    const handleParticipantUpdate = (data) => {
      if (data.roomId === roomData.id) {
        console.log(`RoomPage useEffect (Socket.IO Consolidated): Real-time update for room ${roomData.name}: ${data.newParticipantCount} participants.`);
        setRoomData(prevData => ({
          ...prevData,
          current_participants: data.newParticipantCount,
        }));
        setParticipants(data.newParticipantList);
      }
    };
    socket.on('room:participant_updated', handleParticipantUpdate);

    // Cleanup function for this consolidated effect
    return () => {
      console.log(`RoomPage useEffect (Socket.IO Consolidated): Cleaning up listeners and leaving room: ${socketRoomId}`);
      socket.off('chat:message_received', handleChatMessageReceived); // Detach chat listener
      socket.off('room:participant_updated', handleParticipantUpdate); // Detach participant listener
      // Optional: socket.emit('leave_room', socketRoomId); if backend implements it
    };
  }, [socket, roomData, user]); // Depend on 'socket', 'roomData', and 'user'

  // --- NEW: Effect to scroll chat log to bottom ---
useEffect(() => {
  if (chatLogRef.current) {
    chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
  }
}, [messages]); // Scroll whenever messages change
// ----------------------------------------------

// --- NEW: Function to handle sending messages ---
const handleSendMessage = () => {
  // --- NEW: LOG PRE-CONDITIONS VERY CAREFULLY ---
  console.log('--- handleSendMessage called ---');
  console.log('Socket status:', socket ? 'Connected' : 'Disconnected');
  console.log('RoomData presence:', !!roomData);
  console.log('Message input (trimmed):', messageInput.trim());
  console.log('User username presence:', !!user?.username);
  // ------------------------------------------

  if (!socket?.connected || !roomData?.id || !messageInput.trim() || !user?.username) {
    console.warn('Cannot send message: Socket not connected, room data missing, or empty message/username.');
    return;
  }

  const messagePayload = {
    roomId: roomData.id,
    content: messageInput,
    senderUsername: user.username, // Get username from AuthContext
    // You could add userId: user.id here for backend if needed
  };

  console.log('FE Chat: Emitting "chat:message" to backend with payload:', messagePayload); // LOG THE SENT PAYLOAD
  socket.emit('chat:message', messagePayload);
  setMessageInput(''); // Clear input after sending
  console.log('--- handleSendMessage finished emitting ---');
};
// ---------------------------------------------

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

  const handleCopyLink = async () => {
    const roomUrl = `${window.location.origin}/room/${accessCode}`; // Construct the full URL
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopyMessage('Link copied!');
      setTimeout(() => setCopyMessage(''), 3000); // Clear message after 3 seconds
    } catch (err) {
      console.error('Failed to copy link:', err);
      setCopyMessage('Failed to copy link.');
      setTimeout(() => setCopyMessage(''), 3000);
    }
  };

  // --- NEW: Function to handle leaving the room ---
  const handleLeaveRoom = async () => {
    if (!roomData?.id || !token) {
      setError('Cannot leave: Room data or authentication token missing.');
      return;
    }
    try {
      // Make API call to backend's leave room endpoint
      const response = await fetch(`/api/rooms/${roomData.id}/leave`, {
        method: 'POST', // Or DELETE, depending on what you implemented
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to leave room.');
      }

      console.log(`Successfully left room: ${roomData.name}`);
      // On success, navigate back to dashboard
      navigate('/dashboard', { replace: true });

    } catch (err) {
      console.error('Error leaving room:', err);
      setError(err.message || 'Could not leave room. Please try again.');
    }
  };
  // ---------------------------------------------

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
      
      <hr style={{ margin: '30px auto', width: '80%' }} />

      {/* --- NEW: Share Link Section --- */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleCopyLink}
          style={{
            padding: '10px 15px', backgroundColor: '#6c757d', color: 'white',
            border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1em'
          }}
        >
          Copy Room Link
        </button>
        {copyMessage && <p style={{ marginTop: '10px', color: copyMessage.includes('copied') ? 'green' : 'red' }}>{copyMessage}</p>}
      </div>
      {/* ------------------------------- */}

      {/* --- NEW: Leave Room Button --- */}
      <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '30px' }}>
        <button
          onClick={handleLeaveRoom}
          style={{
            padding: '10px 20px', backgroundColor: '#e9637e', color: 'white', // A softer red for leave
            border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1em'
          }}
          disabled={loading || error || !roomData} // Disable if room data not loaded
        >
          Leave Room
        </button>
      </div>
      {/* --------------------------- */}

      <h3>Who's in the room:</h3>
      {participants.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {participants.map(p => (
            <li key={p.user_id} style={{ padding: '5px 0', borderBottom: '1px dotted #eee', display: 'flex', alignItems: 'center' }}>
              {p.username}
              {/* Optional: Add (You) tag for the current user */}
              {p.user_id === user?.id && <span style={{ color: '#007bff', marginLeft: '10px', fontSize: '0.9em' }}>(You)</span>}
              {/* Optional: Add (Host) tag for the room creator */}
              {p.user_id === roomData.host_id && <span style={{ color: '#28a745', marginLeft: '10px', fontSize: '0.9em' }}>(Host)</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{textAlign: 'center', color: '#666'}}>No participants yet. Be the first!</p>
      )}

      {/* --- NEW: Chat Interface --- */}
      <h3>Room Chat</h3>
      <div
        ref={chatLogRef} // Attach ref for scrolling
        style={{
          height: '300px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '10px',
          overflowY: 'scroll', // Make it scrollable
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '10px',
          backgroundColor: '#f9f9f9',
        }}
      >
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: '8px', alignSelf: msg.senderUsername === user?.username ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '8px', borderRadius: '10px', backgroundColor: msg.senderUsername === user?.username ? '#dcf8c6' : '#e0e0e0' }}>
              <span style={{ fontWeight: 'bold', color: msg.senderUsername === user?.username ? '#128c7e' : '#555', marginRight: '5px' }}>
                {msg.senderUsername === user?.username ? 'You' : msg.senderUsername}:
              </span>
              <span>{msg.content}</span>
              <span style={{ fontSize: '0.7em', color: '#888', marginLeft: '5px' }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#888' }}>No messages yet. Start chatting!</p>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => { // Handle Enter key press
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          placeholder="Type your message..."
          style={{ flexGrow: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
          disabled={!socket || !roomData || !user?.username} // Disable if not connected or not in room or user is null
        />
        <button
          onClick={handleSendMessage}
          style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          disabled={!socket || !roomData || !messageInput.trim() || !user?.username} // Disable if no text or no connection
        >
          Send
        </button>
      </div>
      {/* --------------------------- */}
      
    </div>
  );
}

export default RoomPage;