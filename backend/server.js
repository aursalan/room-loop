require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const { Pool } = require('pg'); // Import Pool from 'pg'
const bcrypt = require('bcrypt'); // Import bcrypt
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const app = express();
const port = 3001;

app.use(express.json()); // Middleware to parse JSON request bodies

// PostgreSQL connection pool configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the database connection on server startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL database at:', res.rows[0].now);
  }
});

// Define a JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Fallback for dev if .env not set, but prefer .env

// User Registration Route
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
  
      res.status(201).json({
        message: 'User registered successfully!',
        user: newUser.rows[0]
      });
  
    } catch (error) {
      console.error('Error during user registration:', error.message);
      res.status(500).json({ message: 'Server error during registration.' });
    }
  });
  
// User Login Route
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

app.get('/', (req, res) => {
  res.send('Hello from Roomloop Backend!');
});

app.listen(port, () => {
  console.log(`Roomloop backend listening at http://localhost:${port}`);
});
