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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white font-sans" style={{ backgroundColor: '#F5F5F7' }}>
    <div className="w-full max-w-md sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl rounded-3xl shadow-md border border-gray-200 bg-white p-10 text-center font-normal min-h-[550px]">
    <img
    src="/infinity.png" // Make sure the file exists at public/logo.png
    alt="RoomLoop Logo"
    className="mx-auto mb-6 w-20 h-20 object-contain"
  />
      <h2 className="text-center leading-relaxed text-gray-700 font-normal">Register for Room Loop</h2>
      <Form onSubmit={handleSubmit} className='items-center'>
          <Input
            label="Email Address"
            variant="bordered"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isRequired
            className='mt-5 h-12'
          />
          <Input
            label="Username"
            variant="bordered"
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            isRequired
            className='mt-5 h-12'
          />
          <Input
            label="Password"
            variant="bordered"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isRequired
            className='mt-5 h-12'
          />
        <Button
          type="submit"
          variant="solid"
          color="primary"
          radius='sm'
          size='sm'
          className='mt-5'
        >
          Register
        </Button>
      </Form>
      {message && <p style={{ marginTop: '15px', color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
    </div>
    </div>
  );
}

export default RegistrationForm;