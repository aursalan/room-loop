import React, {useState} from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Import Routes, Route, Navigate
import { useAuth } from './context/AuthContext';
import './App.css';

// --- Import authentication forms ---
import LoginForm from './components/auth/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';

// --- Import dashboard ---
import Dashboard from './pages/Dashboard'; 

import RoomPage from './pages/RoomPage'; // --- Import RoomPage

import ExplorePage from './pages/ExplorePage';

import HomePage from './pages/HomePage';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  User,
  Link as HeroLink,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle
} from "@heroui/react";
import { ChevronDown } from "lucide-react";

// --- ProtectedRoute Component ---
function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoadingAuth } = useAuth();

  if (isLoadingAuth) { // Show loading state if auth check is in progress
    return <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '1.5em' }}>Loading authentication...</div>;
  }
  if (!isLoggedIn) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }
  return children; // Render the child components if authenticated
}
// ------------------------------------

// --- App Component (main application logic) ---
function App() {
  const { isLoggedIn, user, logout, token, isLoadingAuth } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Keeping these for the header display

  // --- NEW LOG: App Component Render Trace ---
  console.log('App: Component Rendered/Re-rendered. Auth State:', { user: user?.username, token: token ? 'present' : 'null', isLoggedIn, isLoadingAuth });
  // -------------------------------------------

  return (
    <div className="App">
<Navbar onMenuOpenChange={setIsMenuOpen} isBordered shouldHideOnScroll>
  {/* Left: Hamburger (Mobile only) */}
  <NavbarContent className="sm:hidden w-1/3" justify="start">
    <NavbarMenuToggle
      aria-label={isMenuOpen ? "Close menu" : "Open menu"}
    />
  </NavbarContent>

  {/* Center: Brand (Mobile only) */}
  <div className="sm:hidden flex justify-center items-center w-1/3">
    <p className="font-bold text-inherit text-xl">roomloop</p>
  </div>

  {/* Right: Avatar (Mobile only) */}
  <NavbarContent className="sm:hidden w-1/3 justify-end" justify="end">
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <User
          as="button"
          name={isLoggedIn ? user?.username : "User"}
          className="transition-transform"
          avatarProps={{
            src: "",
          }}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="User Menu" variant="flat" className="w-40">
        {isLoggedIn && (
          <DropdownItem
            key="logout"
            className="text-danger"
            color="danger"
            onPress={logout}
          >
            Logout
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  </NavbarContent>

  {/* Full Navbar Content for desktop */}
  <NavbarContent className="hidden sm:flex" justify="start">
    <NavbarBrand>
      <p className="font-bold text-inherit text-xl">roomloop</p>
    </NavbarBrand>
  </NavbarContent>

  <NavbarContent className="hidden sm:flex" justify="center">
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="light"
          className="text-md font-medium"
          endContent={<ChevronDown className="h-4 w-4" />}
        >
          Features
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Features Menu" className="w-72">
        <DropdownItem key="open-chat" description="Users can join rooms and chat freely.">
          🗨️ Open Chat Rooms
        </DropdownItem>
        <DropdownItem key="public-rooms" description="Browse and explore public rooms.">
          🌐 Explore Public Rooms
        </DropdownItem>
        <DropdownItem key="private-rooms" description="Create private rooms and share codes.">
          🔐 Private Room with Code
        </DropdownItem>
        <DropdownItem key="coming-soon" className="text-gray-400 italic">
          🚧 More features dropping soon...
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>

    <NavbarItem>
      <HeroLink
        href="https://github.com/aursalan/room-loop"
        target="_blank"
        className="text-blue-600 font-medium hover:underline"
      >
        GitHub Repo
      </HeroLink>
    </NavbarItem>
  </NavbarContent>

  <NavbarContent className="hidden sm:flex" justify="end">
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <User
          as="button"
          name={isLoggedIn ? user?.username : "User"}
          className="transition-transform"
          avatarProps={{
            src: "",
          }}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="User Menu" variant="flat" className="w-40">
        {isLoggedIn && (
          <DropdownItem
            key="logout"
            className="text-danger"
            color="danger"
            onPress={logout}
          >
            Logout
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  </NavbarContent>

  {/* Mobile Menu */}
  <NavbarMenu className="mt-16">
    <NavbarMenuItem>
      <p className="text-lg font-semibold text-gray-800 mb-2">Features</p>
    </NavbarMenuItem>

    <NavbarMenuItem className="text-sm text-gray-700 pl-4 py-1">
      🗨️ <span className="ml-2">Open Chat Rooms</span>
      <p className="text-xs text-gray-500 ml-6">Users can join rooms and chat freely.</p>
    </NavbarMenuItem>
    <NavbarMenuItem className="text-sm text-gray-700 pl-4 py-1">
      🌐 <span className="ml-2">Explore Public Rooms</span>
      <p className="text-xs text-gray-500 ml-6">Browse and explore public rooms.</p>
    </NavbarMenuItem>
    <NavbarMenuItem className="text-sm text-gray-700 pl-4 py-1">
      🔐 <span className="ml-2">Private Room with Code</span>
      <p className="text-xs text-gray-500 ml-6">Create private rooms and share codes.</p>
    </NavbarMenuItem>
    <NavbarMenuItem className="text-sm italic text-gray-400 pl-4 py-2">
      🚧 More features dropping soon...
    </NavbarMenuItem>

    <hr className="my-2 border-gray-300" />

    <NavbarMenuItem>
      <HeroLink
        href="https://github.com/aursalan/room-loop"
        target="_blank"
        className="text-blue-600 font-medium text-sm pl-4"
      >
        🧑‍💻 GitHub Repo
      </HeroLink>
    </NavbarMenuItem>
  </NavbarMenu>
</Navbar>


      <main>
        <Routes> {/* --- Define routes here --- */}
          
          <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <HomePage />} />

          {/* Public routes */}
          <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginForm />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <RegistrationForm />} />

          {/* Protected routes */}
          {/* Default path '/' can be either login (if not logged in) or dashboard (if logged in) */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> {/* Protecting root path */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> {/* Explicit dashboard path */}

          <Route path="/room/:accessCode" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />

          <Route path="explore" element={<ExplorePage />} />

          {/* Catch-all for 404 (optional but good practice) */}
          <Route path="*" element={<h2 style={{textAlign: 'center'}}>404 - Page Not Found</h2>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;