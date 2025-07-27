import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Import useAuth

import {Form, Input, Button} from "@heroui/react";

function RegistrationForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // To display success/error messages

  const {login} =useAuth(); // Get login function from context

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    setMessage(''); // Clear previous messages

    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/auth/register', { // Use the proxied API path
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json(); // Parse the JSON response

      if (response.ok) { // Check if the response status is 2xx
        setMessage(`Registration successful! Welcome, ${data.user.username}. Logging in...`);
        login(data.token, data.user); // Call login function from context
        setEmail('');
        setUsername('');
        setPassword('');
        // Might redirect the user here later
      } else {
        // Handle errors from the backend
        setMessage(`Registration failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      // Handle network errors or other issues
      console.error('Error during registration:', error);
      setMessage('Network error or server unreachable. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Register for Roomloop</h2>
      <Form onSubmit={handleSubmit} className='items-center'>
          <Input
            label="Email"
            labelPlacement="outside"
            placeholder="Enter email address"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isRequired
          />
          <Input
            label="Username"
            labelPlacement="outside"
            placeholder="Enter username"
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            isRequired
          />
          <Input
            label="Password"
            labelPlacement="outside"
            placeholder=" "
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isRequired
          />
        <Button
          type="submit"
          variant="shadow"
          color="success"
          className='text-white'
        >
          Register
        </Button>
      </Form>
      {message && <p style={{ marginTop: '15px', color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}

export default RegistrationForm;