import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { useAuth } from '../context/AuthContext';
import RoomCreationForm from '../components/room/RoomCreationForm'; // --- Import RoomCreationForm

function Dashboard() {
  const { user, logout, token } = useAuth(); // Also get token to send with API call
  const [profileData, setProfileData] = useState(null); // State to store fetched profile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) { // Ensure we have a token before fetching
        setLoading(false);
        setError("No token found. Please log in.");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/users/me', { // Use the proxied API path
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // --- IMPORTANT: Send JWT ---
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user profile.');
        }

        const data = await response.json();
        setProfileData(data.user); // Assuming backend returns { user: {...} }
        setLoading(false);

      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.message || 'Could not load profile. Please try again.');
        setLoading(false);
        // Optionally, force logout if token is invalid/expired here
        // if (err.message && (err.message.includes('Invalid') || err.message.includes('Expired'))) {
        //   logout();
        // }
      }
    };

    // Fetch profile data only if user is logged in (i.e., token is available)
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false); // If no token, no loading needed
    }

  }, [token]); // Re-run effect if token changes (e.g., after login)

  const handleLogout = () => {
    logout(); // Call logout from AuthContext
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading profile...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {profileData ? (
        <>
          <h2>Welcome to your Dashboard, {profileData.username}!</h2>
          <p>Email: {profileData.email}</p>
          <p>User ID: {profileData.id}</p>
          <p>Account created: {new Date(profileData.created_at).toLocaleDateString()}</p>
          <p>This is a protected page. You can only see this when logged in.</p>
        </>
      ) : (
        <p>No profile data available. Please log in.</p>
      )}
      <button onClick={handleLogout} style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}>Logout</button>

      <RoomCreationForm />

    </div>
  );
}

export default Dashboard;