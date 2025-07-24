import React from 'react';
import './App.css'; // Keep your existing CSS
import RegistrationForm from './components/auth/RegistrationForm'; // Import  component
import LoginForm from './components/auth/LoginForm'; // Import component 

function App() {
  return (
    <div className="App">
      <RegistrationForm />
      <LoginForm/>
    </div>
  );
}

export default App;