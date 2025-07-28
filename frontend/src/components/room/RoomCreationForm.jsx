import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRoomStatus } from '../../utils/dateTimeHelpers';
import {
  Form,
  Input,
  Textarea,
  NumberInput,
  Button,
  Card,
  RadioGroup,
  Radio
} from "@heroui/react";

function RoomCreationForm() {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('public');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');
  const [createdRoom, setCreatedRoom] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setCreatedRoom(null);

    if (!token) {
      setMessage('You must be logged in to create a room.');
      return;
    }

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
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      };

      const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Room "${data.room.name}" created successfully! Access Code: ${data.room.access_code || 'N/A'}`);
        setCreatedRoom(data.room);
        setName('');
        setTopic('');
        setDescription('');
        setType('public');
        setMaxParticipants('');
        setStartTime('');
        setEndTime('');
      } else {
        setMessage(`Failed to create room: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      setMessage('Network error or server unreachable. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 font-sans">
      <Card className="max-w-2xl w-full rounded-3xl shadow-md border border-gray-200 bg-white p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Create a Room</h2>

        <Form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <Input
              label="Room Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isRequired
            />
            <Input
              label="Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-24"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <RadioGroup
              label="Room Type"
              orientation="horizontal"
              value={type}
              onValueChange={(val) => setType(val)}
              className="text-sm"
            >
              <Radio value="public" size='sm' className="text-sm pr-10">Public</Radio>
              <Radio value="private" size='sm' className="text-sm">Private</Radio>
            </RadioGroup>
            <NumberInput
              hideStepper
              label="Max Participants"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              defaultValue={1}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <Input
              labelPlacement="outside-top"
              label="Start Time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              isRequired
            />
            <Input
              labelPlacement="outside-top"
              label="End Time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              isRequired
            />
          </div>

          <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" size='sm' radius='lg'>
            Create Room
          </Button>
        </Form>

        {/* Message */}
        {message && (
          <div className={`mt-5 p-3 text-sm rounded-lg border ${message.includes('success') ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
            {message}
          </div>
        )}

        {/* Created Room Info */}
        {createdRoom && (
          <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-300">
            <h3 className="text-lg font-semibold mb-2">Room: {createdRoom.name}</h3>
            <p><strong>Topic:</strong> {createdRoom.topic || 'N/A'}</p>
            <p><strong>Type:</strong> {createdRoom.type}</p>
            {createdRoom.type === 'private' && <p><strong>Access Code:</strong> {createdRoom.access_code}</p>}
            <p><strong>Start:</strong> {new Date(createdRoom.start_time).toLocaleString()}</p>
            <p><strong>End:</strong> {new Date(createdRoom.end_time).toLocaleString()}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`font-semibold ${getRoomStatus(createdRoom.start_time, createdRoom.end_time) === 'live'
                ? 'text-green-600'
                : getRoomStatus(createdRoom.start_time, createdRoom.end_time) === 'scheduled'
                ? 'text-yellow-600'
                : 'text-red-600'}`}>
                {getRoomStatus(createdRoom.start_time, createdRoom.end_time).toUpperCase()}
              </span>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default RoomCreationForm;
