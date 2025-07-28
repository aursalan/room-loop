// frontend/src/components/Room/JoinRoomForm.jsx

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardFooter, Button, Input } from '@heroui/react';

function JoinRoomForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [accessCode, setAccessCode] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!accessCode) {
      setMessage('Access Code is required to join a room.');
      return;
    }

    navigate(`/room/${accessCode}`);
    setAccessCode('');
    setMessage('Attempting to join room...');
  };

  return (
    <Card isFooterBlurred className="w-[260px] h-[340px] relative overflow-hidden border-none" radius="lg">
      <div className="absolute top-0 left-0 z-0 w-full h-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500" />

      <CardFooter className="z-10 absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md text-white p-4 rounded-b-lg">
        <form onSubmit={handleSubmit} className="w-full">
          <p className="text-sm mb-1">Join a Private Room</p>
          {user && <p className="text-xs mb-2">@{user.username}</p>}

          <Input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Enter access code"
            size="sm"
            radius="sm"
            className="mb-3 text-black"
            classNames={{ inputWrapper: "bg-white/60 backdrop-blur-sm" }}
          />

          <Button
            type="submit"
            className="text-xs text-white bg-black/30"
            color="default"
            radius="lg"
            size="sm"
            variant="flat"
          >
            Join Room
          </Button>

          {message && (
            <p className={`text-xs mt-2 ${message.includes('required') ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </p>
          )}
        </form>
      </CardFooter>
    </Card>
  );
}

export default JoinRoomForm;
