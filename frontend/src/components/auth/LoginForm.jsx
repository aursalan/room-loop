import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Import useAuth

// Helper function to validate email format (basic regex)
const isValidEmail = (input) => {
  // Very basic email regex, for more robust validation consider external libraries
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
};

function LoginForm() {
  const [emailOrUsername, setEmailOrUsername] = useState(''); // Unified state for input
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const {login} = useAuth(); // Get login function from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Prepare the payload based on whether input is email or username
    let payload;
    if (isValidEmail(emailOrUsername)) {
      payload = { email: emailOrUsername, password };
    } else {
      payload = { username: emailOrUsername, password };
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Send the conditionally prepared payload
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Login successful! Redirecting...');
        login(data.token, data.user); // Call login function from context
        setEmailOrUsername(''); // Clear input on success
        setPassword('');
        console.log('Login Success:', data);
        // You will redirect the user here later
      } else {
        setMessage(`Login failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('Network error or server unreachable. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login to Roomloop</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email-or-username" style={{ display: 'block', marginBottom: '5px' }}>Email or Username:</label>
          <input
            type="text" // Changed type to 'text' for flexibility
            id="email-or-username"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="login-password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}
        >
          Login
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}

export default LoginForm;