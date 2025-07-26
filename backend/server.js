require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const { Pool } = require('pg'); // Import Pool from 'pg'
const bcrypt = require('bcrypt'); // Import bcrypt
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const cron = require('node-cron'); // Import node-cron
const http = require('http'); // Import http module
const { Server } = require('socket.io'); // Import Server from socket.io

// --- User-defined utility to generate unique codes (optional, put in separate file later) ---
function generateAccessCode() {
  // Generates a random 6-character alphanumeric code
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
// ------------------------------------------

const app = express();
const port = 3001;

app.use(express.json()); // Middleware to parse JSON request bodies

// --- PostgreSQL connection pool configuration ---
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
// ------------------------------------------

// --- Test the database connection on server startup ---
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL database at:', res.rows[0].now);
  }
});
// ------------------------------------------

// --- Define a JWT secret ---
const JWT_SECRET = process.env.JWT_SECRET;

// JWT Validation Middleware 
function authenticateToken(req, res, next) {
  // Get the token from the Authorization header
  // Expected format: "Authorization: Bearer <TOKEN>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token part after "Bearer "

  if (token == null) {
    // No token provided at all
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  // Verify the token using your JWT_SECRET
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Token is invalid (e.g., signature mismatch, malformed) or expired
      console.error('JWT verification error:', err.message); // Log the specific error for debugging
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    // If the token is valid, attach the decoded user payload to the request object
    // This 'user' object contains { id, username, email } that you put in the token during login
    req.user = user;
    next(); // Proceed to the next middleware or route handler (the actual API endpoint)
  });
}
// ------------------------------------------

// --- User Registration Route ---
app.post('/api/auth/register', async (req, res) => {
    const { email, username, password } = req.body;
  
    // Basic validation (want more robust validation later)
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    try {
      // 1. Check if email or username already exists
      const userExists = await pool.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );
  
      if (userExists.rows.length > 0) {
        return res.status(409).json({ message: 'Email or username already in use.' });
      }
  
      // 2. Hash the password
      const saltRounds = 10; // The cost factor for hashing
      const passwordHash = await bcrypt.hash(password, saltRounds);
  
      // 3. Save the new user to the database
      const newUser = await pool.query(
        'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
        [email, username, passwordHash]
      );

      const registeredUser = newUser.rows[0]; // Get the newly registered user's data

    // --- Generate a JWT for the newly registered user ---
    const token = jwt.sign(
      { id: registeredUser.id, username: registeredUser.username, email: registeredUser.email },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );
    // --------------------------------------------------------
  
    res.status(201).json({
      message: 'User registered successfully!',
      user: { // Return necessary user details
          id: registeredUser.id,
          username: registeredUser.username,
          email: registeredUser.email
      },
      token: token // --- NEW: Include the generated token in the response ---
    });
    
    } catch (error) {
      console.error('Error during user registration:', error.message);
      res.status(500).json({ message: 'Server error during registration.' });
    }
  });
// ------------------------------------------
  
// --- User Login Route ---
app.post('/api/auth/login', async (req, res) => {
    const { email, username , password } = req.body;
  
    if (!email && !username || !password ) {
      return res.status(400).json({ message: 'Email or username and password are required.' });
    }
  
    try {
      // 1. Find the user by email or username
      const userResult = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email,username]);
      const user = userResult.rows[0];
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' }); // Use generic message for security
      }
  
      // 2. Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
  
      // 3. Generate a JWT
      // The payload should contain minimal, non-sensitive user data (e.g., user ID, username, email)
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );
  
      res.status(200).json({
        message: 'Logged in successfully!',
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
  
    } catch (error) {
      console.error('Error during user login:', error.message);
      res.status(500).json({ message: 'Server error during login.' });
    }
  });
// ------------------------------------------

// --- User Profile API (Protected) ---
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    // req.user is populated by the authenticateToken middleware
    const userId = req.user.id;

    // Fetch user from the database using the ID from the token
    const userResult = await pool.query(
      'SELECT id, email, username, created_at FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    if (!user) {
      // This case should ideally not happen if JWT verification works,
      // but it's good for robustness if a user was deleted after token issue.
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ user });

  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
});
// ------------------------------------------

// --- Create Room API ---
app.post('/api/rooms', authenticateToken, async (req, res) => {
  const {
    name,
    topic,
    description,
    type, // 'public' or 'private'
    max_participants,
    startTime, // From frontend, will be ISO string
    endTime // From frontend, will be ISO string
  } = req.body;

  // Basic validation
  if (!name || !type || !startTime || !endTime) {
    return res.status(400).json({ message: 'Name, type, start time, and end time are required.' });
  }
  if (type !== 'public' && type !== 'private') {
    return res.status(400).json({ message: 'Room type must be "public" or "private".' });
  }
  if (new Date(startTime) < new Date()) {
    return res.status(400).json({ message: 'Start time cannot be in the past.' });
  }
  if (new Date(startTime) >= new Date(endTime)) {
    return res.status(400).json({ message: 'End time must be after start time.' });
  }

  try {
    const hostId = req.user.id; // Get hostId from the authenticated user's token

    let accessCode = generateAccessCode();

    const newRoom = await pool.query(
      `INSERT INTO rooms (
        host_id, name, topic, description, type, max_participants,
        start_time, end_time, access_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`, // Return all columns of the new room
      [
        hostId, name, topic, description, type,
        max_participants || null, // Allow max_participants to be null if not provided
        startTime, endTime, accessCode
      ]
    );

    res.status(201).json({
      message: 'Room created successfully!',
      room: newRoom.rows[0]
    });

  } catch (error) {
    console.error('Error during room creation:', error.stack); // Log full stack for detailed error
    res.status(500).json({ message: 'Server error during room creation.' });
  }
});
// ------------------------------------------

// --- Room Status Update Scheduler ---
const roomStatusUpdateJob = cron.schedule('* * * * *', async () => { // Runs every minute
  // The cron string '*/5 * * * *' would run every 5 minutes
  // The cron string '*/1 * * * *' runs every 1 minute
  // Learn more about cron syntax: https://crontab.guru/
  
    console.log('Running room status update job...');
    const now = new Date(); // Get current timestamp
  
    try {
      // 1. Update 'scheduled' rooms to 'live'
      const scheduledToLive = await pool.query(
        `UPDATE rooms
         SET status = 'live', updated_at = NOW()
         WHERE status = 'scheduled' AND start_time <= $1
         RETURNING id, name, status`,
        [now]
      );
      if (scheduledToLive.rowCount > 0) {
        console.log(`Updated ${scheduledToLive.rowCount} rooms to LIVE:`, scheduledToLive.rows.map(r => r.name).join(', '));
      }
  
      // 2. Update 'live' rooms to 'closed'
      const liveToClosed = await pool.query(
        `UPDATE rooms
         SET status = 'closed', updated_at = NOW()
         WHERE status = 'live' AND end_time <= $1
         RETURNING id, name, status`,
        [now]
      );
      if (liveToClosed.rowCount > 0) {
        console.log(`Updated ${liveToClosed.rowCount} rooms to CLOSED:`, liveToClosed.rows.map(r => r.name).join(', '));
      }
  
    } catch (error) {
      console.error('Error in room status update job:', error.stack);
    }
  }, {
    scheduled: true, // Make sure it's scheduled to run automatically
    timezone: "Asia/Kolkata" // --- IMPORTANT: Set your timezone here (e.g., "Asia/Kolkata", "America/New_York")
                             // This ensures your server's NOW() matches your expected time.
  });
// ------------------------------------

// --- Create HTTP server and Socket.IO server ---
const server = http.createServer(app); // Create an HTTP server from your Express app
const io = new Server(server, {
  cors: { // Configure CORS for Socket.IO connections (from your frontend)
    origin: "*", // Your React app's development URL
    methods: ["GET", "POST", "PUT"]
  }
});

io.on('connection', (socket) => {
  console.log('A client connected!', socket.id);


  // --- NEW: Handle joining a Socket.IO room ---
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket.IO: Client ${socket.id} joined room: ${roomId}`);
  });
  // ------------------------------------------

  // --- NEW: Handle chat messages ---
  socket.on('chat:message', (payload) => {
    const { roomId, content, senderUsername } = payload;

    // Basic validation (for MVP)
    if (!roomId || !content || !senderUsername) {
      console.warn('Socket.IO: Invalid chat message payload received.');
      return;
    }

    // --- IMPORTANT: For MVP, we ASSUME the sender is authenticated and in the room
    // For production, you'd verify JWT on socket connection and check if user is in roomId's participant list

    // Prepare message data
    const messageData = {
      roomId,
      senderUsername,
      content,
      timestamp: new Date().toISOString(), // Server-side timestamp
      // messageId: Math.random().toString(36).substring(2, 9), // Simple ID for uniqueness
    };

    // Broadcast message to all clients IN THAT SPECIFIC ROOM
    io.to(roomId).emit('chat:message_received', messageData);
    console.log(`Socket.IO: Message "${content}" from ${senderUsername} broadcast to room ${roomId}`);
  });
  // -------------------------------

  socket.on('disconnect', () => {
    console.log('Socket.IO: Client disconnected!', socket.id);
    // --- NEW: Optional: Handle leaving Socket.IO rooms on disconnect (more complex for MVP) ---
    // You might iterate through rooms socket.rooms and remove, or just let it handle by itself.
  });

  // You'll add more real-time logic here later (e.g., room:participant_updated from join API)
});
// ----------------------------------------------------

// --- Join Room API (via access code) ---
app.post('/api/rooms/:accessCode/join', authenticateToken, async (req, res) => {
  const { accessCode } = req.params; // Get accessCode from URL parameters
  const userId = req.user.id; // Get userId from authenticated user
  const username = req.user.username; // Get username from authenticated user

  // Basic validation: accessCode must be provided in URL
  if (!accessCode) {
    return res.status(400).json({ message: 'Access code is required in the URL.' });
  }

  try {
    // 1. Find the room by access code and get details including current active participants
    const roomResult = await pool.query(
      `SELECT
          r.id,
          r.host_id,
          r.name,
          r.topic,
          r.description,
          r.type,
          r.status,
          r.max_participants,
          r.access_code,
          r.start_time,
          r.end_time,
          (SELECT COUNT(*) FROM room_participants WHERE room_id = r.id AND left_at IS NULL) as current_active_participants
       FROM
          rooms r
       WHERE r.access_code = $1`, // <<< --- ENSURE THIS LINE ENDS WITH A BACKTICK (`) --- >>>
      [accessCode]
    );

    const room = roomResult.rows[0];

    // If room not found
    if (!room) {
      return res.status(404).json({ message: 'Room not found with this access code.' });
    }

    // 2. Check Room Status: Must be 'live' to join
    if (room.status !== 'live') {
      return res.status(403).json({ message: `Cannot join room. Room is ${room.status}.` });
    }

    // 3. Check if max participants reached (if defined)
    const currentParticipantCount = parseInt(room.current_active_participants, 10);
    if (room.max_participants && currentParticipantCount >= room.max_participants) {
      return res.status(409).json({ message: 'Room is full. Maximum participants reached.' });
    }

    // 4. Check if user is already an active participant
    const existingActiveParticipant = await pool.query(
      `SELECT * FROM room_participants WHERE room_id = $1 AND user_id = $2 AND left_at IS NULL`,
      [room.id, userId]
    );

    if (existingActiveParticipant.rows.length > 0) {
      return res.status(409).json({ message: 'You are already an active participant in this room.' });
    }

    // 5. Record participation (first time only)
    await pool.query(
      `INSERT INTO room_participants (room_id, user_id) VALUES ($1, $2)`,
      [room.id, userId]
    );

    // Fetch actual current active participants count and list AFTER the join
    const currentParticipantsData = await pool.query(
      `SELECT rp.user_id, u.username
       FROM room_participants rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = $1 AND rp.left_at IS NULL`,
      [room.id]
    );
    const currentActiveParticipantsList = currentParticipantsData.rows;
    const updatedParticipantCount = currentActiveParticipantsList.length;

    // --- Emit Socket.IO event ---
    // For MVP simplicity, we'll emit to all connected clients.
    // For production, you'd use io.to(room.id).emit(...) if clients join Socket.IO rooms.
    io.emit('room:participant_updated', {
      roomId: room.id,
      userId: userId, // User who just joined
      username: username, // Include username
      action: 'joined',
      newParticipantCount: updatedParticipantCount,
      newParticipantList: currentActiveParticipantsList, // This is the value being sent
      roomName: room.name,
      roomType: room.type, // Useful for frontend to filter
      start_time: room.start_time,
      end_time: room.end_time,
    });
    console.log(`Socket.IO: Emitted 'room:participant_updated' for room ${room.name} (Joined: ${username})`);
    console.log('Backend: Room object fetched from DB in Join API:', room);
    // -------------------------------------------------------------

    res.status(200).json({
      message: `Successfully joined room "${room.name}"!`,
      room: {
        id: room.id,
        name: room.name,
        topic: room.topic,
        description: room.description,
        type: room.type,
        status: room.status,
        current_participants: updatedParticipantCount, // Send the actual updated count
        participants: currentActiveParticipantsList, // This is the list sent
        start_time: room.start_time, // --- NEW: Include start_time here ---
        end_time: room.end_time,     // --- NEW: Include end_time here ---
      }
    });

  } catch (error) {
    console.error('Error joining room (simple version):', error.stack);
    res.status(500).json({ message: 'Server error during joining room.' });
  }
});
// ------------------------------------------

// ---Leave Room API ---
app.post('/api/rooms/:roomId/leave', authenticateToken, async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;
  const userUsername = req.user.username; // From JWT payload

  try {
    // 1. Check if the user is an active participant in this room
    const participantCheck = await pool.query(
      `SELECT * FROM room_participants WHERE room_id = $1 AND user_id = $2 AND left_at IS NULL`,
      [roomId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(404).json({ message: 'You are not an active participant in this room.' });
    }

    // 2. Remove the participant (simple DELETE for MVP)
    await pool.query(
      `DELETE FROM room_participants WHERE room_id = $1 AND user_id = $2`,
      [roomId, userId]
    );
    // Note: For a re-joinable system, you'd UPDATE left_at=NOW() instead of DELETE.

    // 3. Fetch updated active participant list for broadcast and response
    const currentParticipantsData = await pool.query(
      `SELECT rp.user_id, u.username
       FROM room_participants rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = $1 AND rp.left_at IS NULL`,
      [roomId]
    );
    const currentActiveParticipantsList = currentParticipantsData.rows;
    const updatedParticipantCount = currentActiveParticipantsList.length;

    // 4. Emit Socket.IO event to broadcast the update
    if (io) { // Ensure io instance exists
      io.to(roomId).emit('room:participant_updated', { // Use io.to(roomId) for specific room broadcast
        roomId: roomId,
        userId: userId, // User who just left
        username: userUsername, // User who just left
        action: 'left',
        newParticipantCount: updatedParticipantCount,
        newParticipantList: currentActiveParticipantsList,
      });
      console.log(`Socket.IO: Emitted 'room:participant_updated' for room ${roomId} (Left: ${userUsername})`);
    } else {
      console.warn('Socket.IO instance (io) not available for broadcast in Leave Room API.');
    }

    res.status(200).json({ message: 'Successfully left the room.' });

  } catch (error) {
    console.error('Error leaving room:', error.stack);
    res.status(500).json({ message: 'Server error during leaving room.' });
  }
});
// ------------------------------------

// --- List Public Rooms API (WITH TAG & STATUS FILTERS - Consolidated Code) ---
app.get('/api/rooms/public', authenticateToken, async (req, res) => {
  try {
    const { tag, status } = req.query; // Extract 'tag' and 'status' query parameters

    let queryParts = []; // Array to hold parts of the WHERE clause
    let queryParams = []; // Array to hold parameters for the SQL query
    let paramIndex = 1; // Counter to generate $1, $2, $3... for parameterized query

    // Base filter: Always include public rooms
    queryParts.push(`r.type = 'public'`);

    // Handle Status Filter
    if (status) {
      const now = new Date(); // Get current timestamp for 'starting_soon' calculation
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000); // Calculate 30 minutes from now

      if (status === 'live') {
        queryParts.push(`r.status = 'live'`);
      } else if (status === 'starting_soon') {
        // Rooms are 'starting soon' if they are 'scheduled' and start within the next 30 minutes
        queryParams.push(now.toISOString()); // Parameter for NOW()
        queryParams.push(thirtyMinutesFromNow.toISOString()); // Parameter for 30 minutes from NOW
        
        // Use dynamically incrementing parameter indices
        queryParts.push(`r.status = 'scheduled' AND r.start_time > $${paramIndex++} AND r.start_time <= $${paramIndex++}`);
      } else {
        // Invalid status value provided
        return res.status(400).json({ message: 'Invalid status filter. Must be "live" or "starting_soon".' });
      }
    } else {
      // Default behavior if no status filter is provided: only 'live' public rooms
      queryParts.push(`r.status = 'live'`);
    }

    // Handle Tag Filter (maps to r.topic field in your database)
    if (tag) {
      queryParams.push(`%${tag.toLowerCase()}%`); // Add parameter value for tag
      queryParts.push(`LOWER(r.topic) LIKE $${paramIndex++}`); // Use dynamically incrementing parameter index
    }

    // Combine all query parts into a WHERE clause string
    const whereClauseString = queryParts.length > 0 ? `WHERE ${queryParts.join(' AND ')}` : '';

    // Construct the full SQL query
    const query = `
      SELECT
          r.id,
          r.name,
          r.topic,
          r.description,
          r.type,
          r.max_participants,
          r.start_time,
          r.end_time,
          r.status,
          r.access_code, -- Include access_code if needed for display or filtering later, otherwise remove
          u.username AS host_username,
          (SELECT COUNT(*) FROM room_participants WHERE room_id = r.id AND left_at IS NULL) as current_active_participants
       FROM rooms r
       JOIN users u ON r.host_id = u.id
       ${whereClauseString}
       ORDER BY r.start_time ASC
    `;

    // Execute the query with the collected parameters
    const publicRooms = await pool.query(query, queryParams);

    res.status(200).json(publicRooms.rows);

  } catch (error) {
    console.error('Error fetching public rooms with filters:', error.stack);
    res.status(500).json({ message: 'Server error while fetching public rooms.' });
  }
});
// --------------------------------------------------------------------------------------------------

// --- Root API ---
app.get('/api', (req, res) => {
  res.send('Hello from Roomloop Backend!');
});
// ------------------------------------------

server.listen(port, () => { // --- Use server.listen instead of app.listen ---
  console.log(`Roomloop backend listening at http://localhost:${port}`);
  console.log('Socket.IO server active.');
});
