import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext'; // Import SocketProvider
import {HeroUIProvider} from '@heroui/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <HeroUIProvider>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </HeroUIProvider>
  // </React.StrictMode>,
);