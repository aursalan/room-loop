// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import RoomCreationForm from '../components/room/RoomCreationForm';
import JoinRoomForm from '../components/room/JoinRoomForm';
import { Card, CardHeader, CardBody, CardFooter, Divider, Image, Button } from "@heroui/react";
import { Link } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';

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
    <div className="mt-10 px-4">
  {/* Headline Section */}
  <div className="text-center mb-10">
    <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
      Dashboard.
      <span className="font-normal text-gray-600"> Your portal to control and connect.</span>
    </h1>
  </div>

  {/* Cards Section */}
  <div className="flex flex-col md:flex-row justify-center items-center gap-10">
    {/* Profile Card */}
    {profileData && (
      <Card className="w-[260px] h-[340px] flex flex-col justify-between">
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
        <CardBody className="flex-grow">
          <p className="text-sm text-gray-700">
          <Typewriter
            words={["Hey there, RoomLooper! This is your space to explore rooms, join live discussions, and build your event footprint. Update your profile, check your invites, or start your own room — all from here. Let's make some noise 🔊"]}
            loop={1}
            cursor
            cursorStyle="."
            typeSpeed={85}
          />
          </p>
        </CardBody>
        <Divider />
        <CardFooter className="flex flex-col items-start">
          <p className="text-xs text-default-500">
            Account Created: {new Date(profileData.created_at).toLocaleDateString()}
          </p>
        </CardFooter>
      </Card>
    )}

    {/* Public Room Card */}
    <Card
  isFooterBlurred
  className="w-[260px] h-[340px] relative overflow-hidden border-none"
  radius="lg"
>
  <div className="w-full h-full relative">
    <img
      alt="Public Rooms"
      className="object-cover w-full h-full absolute top-0 left-0 z-0"
      src="open.jpg"
    />
  </div>

  <CardFooter
    className="z-10 absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md text-white p-4 rounded-b-lg"
  >
    <div className="flex justify-between items-center w-full">
      <p className="text-sm">Public Rooms</p>
      <Link to="/explore">
        <Button
          className="text-xs text-white bg-black/30"
          color="default"
          radius="lg"
          size="sm"
          variant="flat"
        >
          Explore
        </Button>
      </Link>
    </div>
  </CardFooter>
</Card>
<JoinRoomForm/>
  </div>

  <RoomCreationForm/>

</div>

  );
}

export default Dashboard;
