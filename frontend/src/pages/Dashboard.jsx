// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import RoomCreationForm from '../components/room/RoomCreationForm';
import JoinRoomForm from '../components/room/JoinRoomForm';
import { Card, CardHeader, CardBody, CardFooter, Divider, Image } from "@heroui/react";

function Dashboard() {
  const { user, logout, token, isLoadingAuth } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetchedProfile = useRef(false);

  // Random logo from /public/icon1.png to icon5.png
  const iconIndex = Math.floor(Math.random() * 8) + 1;
  const iconSrc = `/icon${iconIndex}.png`;

  useEffect(() => {
    const fetchUserProfile = async (authToken) => {
      if (!authToken) {
        setLoading(false);
        setProfileData(null);
        setError("Authentication token missing.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/users/me', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user profile.');
        }

        const data = await response.json();
        setProfileData(data.user);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Could not load profile.');
        setLoading(false);
      }
    };

    if (isLoadingAuth) return;
    if (token && !hasFetchedProfile.current) {
      fetchUserProfile(token);
      hasFetchedProfile.current = true;
    }

    return () => {
      hasFetchedProfile.current = false;
    };
  }, [token, isLoadingAuth]);

  const handleLogout = () => logout();

  if (loading) return <div className="text-center mt-10">Loading profile...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col items-center px-4 mt-10 space-y-8">
      {profileData && (
        <Card className="max-w-md w-full">
          <CardHeader className="flex gap-3 items-center">
            <Image
              alt="User Icon"
              height={40}
              radius="sm"
              src={iconSrc}
              width={40}
            />
            <div className="flex flex-col">
              <p className="text-md font-semibold">{profileData.username}</p>
              <p className="text-sm text-default-500">{profileData.email}</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="text-sm text-gray-700">Welcome to your Room Loop Dashboard - your space to create, connect, and collaborate.</p>
          </CardBody>
          <Divider />
          <CardFooter className="flex flex-col items-start">
            <p className="text-xs text-default-500">Account Created: {new Date(profileData.created_at).toLocaleDateString()}</p>
          </CardFooter>
        </Card>
      )}

      {/* These are OUTSIDE the card */}
      <div className="w-full max-w-xl">
        <RoomCreationForm />
        <Divider className="my-6" />
        <JoinRoomForm />
      </div>
    </div>
  );
}

export default Dashboard;
