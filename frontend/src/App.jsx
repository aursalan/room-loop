import { useState, useEffect } from 'react' // Import useState and useEffect
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [backendMessage, setBackendMessage] = useState(''); // State to store backend message

  useEffect(() => { // useEffect hook to run code after component mounts
    // Make a request to your backend's root route via the proxy
    // The browser sees '/api/' -> Vite proxy forwards to 'http://localhost:3001/'
    fetch('/api')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text(); // Get response as text since backend sends "Hello from Roomloop Backend!"
      })
      .then(data => {
        setBackendMessage(data); // Set the message received from backend
        console.log('Proxy Test Success! Message from backend:', data); // Log to console
      })
      .catch(error => {
        console.error('Proxy Test Failed:', error); // Log any errors
        setBackendMessage('Failed to connect to backend via proxy.');
      });
  }, []); // Empty dependency array means this effect runs once after initial render

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        {/* Display the message from the backend */}
        <p><strong>Backend Proxy Status:</strong> {backendMessage}</p> {/* --- NEW Display area */}
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App