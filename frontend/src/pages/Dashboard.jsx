// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect, useRef } from 'react'; // --- NEW: Import useRef
import { useAuth } from '../context/AuthContext'; // Ensure useAuth is imported
// Ensure these import paths are correct based on your file structure:
import RoomCreationForm from '../components/Room/RoomCreationForm'; // Corrected path
import JoinRoomForm from '../components/Room/JoinRoomForm'; // Corrected path
import { Link, useNavigate } from 'react-router-dom'; 

function Dashboard() {
  // Get isLoadingAuth from useAuth() along with other auth states
  const { user, logout, token, isLoadingAuth } = useAuth(); // --- NEW: Get isLoadingAuth
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true); // Initial loading for profile fetch
  const [error, setError] = useState(null);

  // --- NEW: Ref to guard useEffect for API calls to run only once per logical mount ---
  // This helps prevent double fetches in StrictMode and ensures the fetch logic runs cleanly.
  const hasFetchedProfile = useRef(false);
  // ---------------------------------------------------------------------------------

  useEffect(() => {
    const fetchUserProfile = async (authToken) => { // Accept token as argument
      // This internal check prevents a fetch if token is null (e.g., after logout)
      // but should only be hit if the external conditions in the useEffect were met.
      if (!authToken) {
        setLoading(false);
        setProfileData(null); // Ensure profile data is null if no token
        setError("Authentication token missing for profile fetch."); // More specific internal error
        return;
      }
      try {
        setLoading(true); // Set loading true before fetch
        setError(null); // Always clear error before a new fetch attempt
        
        // Console log for debugging the fetch initiation (can remove after verification)
        console.log('Dashboard: Attempting to fetch user profile...'); 

        const response = await fetch('/api/users/me', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`, // Use argument token
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user profile.');
        }

        const data = await response.json();
        setProfileData(data.user);
        setLoading(false); // Set loading false on success
        // Console log for debugging the successful fetch (can remove after verification)
        console.log('Dashboard: Successfully fetched user profile:', data.user); 

      } catch (err) {
        console.error('Dashboard: Error fetching user profile:', err); // Log full error
        setError(err.message || 'Could not load profile. Please try again.');
        setLoading(false); // Set loading false on error
        setProfileData(null); // Ensure profile data is null on error
      }
    };

    // --- MODIFIED: Logic to conditionally call fetchUserProfile based on isLoadingAuth and token ---
    if (isLoadingAuth) { // If auth state is still loading (from localStorage), wait.
      console.log('Dashboard useEffect: Authentication state still loading. Waiting to fetch profile...');
      // Keep Dashboard in a loading state until auth is confirmed.
      return; 
    }

    // Now, auth state is loaded (isLoadingAuth is false)
    if (token) { // If a token is available (user is logged in)
      if (!hasFetchedProfile.current) { // And we haven't fetched it yet for this mount cycle
        console.log('Dashboard useEffect: Auth loaded, token present. Calling fetchUserProfile.');
        fetchUserProfile(token); // Call fetch function with the current token
        hasFetchedProfile.current = true; // Mark as fetched attempt
      } else {
        console.log('Dashboard useEffect: Auth loaded, token present, but profile already fetched for this cycle.');
      }
    } else { // If auth is loaded, but no token (user is genuinely logged out)
      console.log('Dashboard useEffect: Auth loaded, but no token. User not logged in.');
      setLoading(false); // Stop dashboard loading
      setProfileData(null); // Clear any old profile data
      setError("Please log in to view your dashboard."); // Specific error for this state
      hasFetchedProfile.current = true; // Mark that we've handled the "no token" case for this cycle
    }
    
    // --- NEW: Cleanup for StrictMode to reset ref ---
    // This ensures that if the component unmounts and remounts (as in StrictMode dev),
    // the fetchUserProfile will run again on the second mount.
    return () => {
      hasFetchedProfile.current = false;
      console.log('Dashboard useEffect: Cleanup - reset hasFetchedProfile.current');
    };
    // -------------------------------------------------

  }, [token, isLoadingAuth, user, logout]); // Dependencies for useEffect

  // --- Render Logic for Dashboard ---
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading profile...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>Error: {error}</div>;
  }

  // --- NEW: Define handleLogout function ---
  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
  };
  // ----------------------------------------

  // This message now only shows if profileData is null AND not loading AND no error
  // (e.g., after initial load when logged out, or if fetchUserProfile explicitly sets null)
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {profileData ? (
        <>
          <h2>Welcome to your Dashboard, {profileData.username}!</h2>
          <p>Email: {profileData.email}</p>
          <p>User ID: {profileData.id}</p>
          <p>Account created: {new Date(profileData.created_at).toLocaleDateString()}</p>
          <p>This is a protected page. You can only see this when logged in.</p>
          {/* --- NEW: Explore Page Link/Button --- */}
          <div style={{ marginTop: '30px', marginBottom: '30px' }}>
            <Link to="/explore" style={{
              padding: '10px 20px', backgroundColor: '#6f42c1', color: 'white',
              border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1em',
              textDecoration: 'none' // Remove underline for link
            }}>
              Explore Public Rooms
            </Link>
            {/* Or if you prefer a button:
            <button onClick={() => navigate('/explore')} style={{
              padding: '10px 20px', backgroundColor: '#6f42c1', color: 'white',
              border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1em'
            }}>
              Explore Public Rooms
            </button>
            */}
          </div>
          {/* --------------------------------- */}
        </>
      ) : (
        // This will display "Loading authentication..." (from ProtectedRoute if not loaded)
        // or "No profile data available. Please log in." after AuthContext fully loads and no token.
        // It will no longer display the previous direct error message string if 'error' state is not explicitly set.
        <p>{error || (isLoadingAuth ? "Loading authentication..." : "No profile data available. Please log in.")}</p>
      )}

      <RoomCreationForm />

      <hr style={{ margin: '40px auto', width: '50%' }} />

      <JoinRoomForm />

    </div>
  );
}

export default Dashboard;