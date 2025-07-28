import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom'; // --- NEW: Import useNavigate

import {Form, Input, Button} from "@heroui/react";

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
  const navigate = useNavigate(); // --- NEW: Initialize useNavigate


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
      const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/auth/login', {
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
        navigate('/dashboard', { replace: true }); // --- NEW: Redirect on successful login ---
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white font-sans" style={{ backgroundColor: '#F5F5F7' }}>
    <div className="w-full max-w-md sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl rounded-3xl shadow-md border border-gray-200 bg-white p-10 text-center font-normal min-h-[550px]">
    <img
    src="/infinity.png" // Make sure the file exists at public/logo.png
    alt="RoomLoop Logo"
    className="mx-auto mb-6 w-20 h-20 object-contain"
  />
      <h2 className="text-center leading-relaxed text-gray-700">Login to Room Loop</h2>
      <Form onSubmit={handleSubmit} className='items-center'>
          <Input
          isRequired
          label="Email or Username"
          type="text"
          variant="bordered"
          id="email-or-username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          className='mt-5 h-12'
          
          />
          <Input
          isRequired
          label="Password"
          type="password"
          variant="bordered"
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          Login
          </Button>
      </Form>
      {message && <p style={{ marginTop: '15px', color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
      {/* --- NEW: Link to Registration Page --- */}
      <p style={{ textAlign: 'center', color: 'black', marginTop: '20px', fontSize: '0.9em' }}>
        Don't have an account? <a href="#" onClick={() => navigate('/register')} style={{ color: '#007bff', textDecoration: 'none' }}>Register here</a>
      </p>
      {/* ------------------------------------- */}
    </div>
    </div>
  );
}

export default LoginForm;