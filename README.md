# Roomloop - The Drop-In Events & Short-Term Group Platform

## ⚡ Spontaneous Connections, Instant Meetups ⚡

Roomloop is a full-stack web application designed to facilitate quick, spontaneous, and low-friction group interactions. Imagine needing a study buddy, a quick brainstorming session, or a chill hangout—Roomloop lets you create or join a "room" in moments, without formal invites or pre-scheduled calls. It's built for drop-in events, fostering real-time, async-compatible coordination.

---

## ✨ Features Implemented (MVP)

The Roomloop MVP provides the following core functionalities, all implemented from scratch:

* **Secure User Authentication:**
    * Robust user registration and login with email/username and password hashing (`bcrypt`).
    * Stateless session management using JSON Web Tokens (JWT) for protected API access.
    * User authorization middleware ensures only authenticated users can access restricted backend resources.
* **Personalized Dashboard:**
    * A protected user dashboard displaying basic profile information fetched securely from the backend.
    * **Enhanced Navigation:** Clear links from Login to Register page, and automatic redirection to Dashboard post-authentication.
* **Room Creation:**
    * Authenticated users can create new public or private rooms with dynamic details (name, topic, description, max participants, start/end times).
    * Rooms automatically transition status (`scheduled`, `live`, `closed`) based on time (backend cron job).
    * Private rooms receive a unique `access_code`. (Note: For MVP simplicity, public rooms also generate an `access_code` for consistent joining).
* **Room Joining:**
    * Users can join `live` rooms by navigating to a dedicated `RoomPage` URL (`/room/:accessCode`).
    * Backend validates room status, capacity, and records active participation.
    * **Graceful Conflict Handling:** The `RoomPage` gracefully handles `409 Conflict` (user already in room) by attempting to display the room content, rather than showing an error.
* **Real-time Participant List:**
    * Live participant counts and a dynamic list of active usernames are displayed on the Room Page using Socket.IO.
    * The list updates in real-time as users join or leave a room.
* **Public Room Discovery:**
    * An "Explore" page allows authenticated users to browse and discover currently `live` public rooms.
    * **Dynamic Room Filtering:** Users can filter public rooms by `tag` (room topic) and `status` ('live' or 'starting_soon' within the next 30 minutes).
    * **Direct Join from Explore Page:** Public room cards on the Explore page include direct "Join Room" buttons/links that navigate to the corresponding `RoomPage` using the room's `access_code`.
* **Room Link Sharing:** Users can easily copy a room's direct URL to their clipboard for quick sharing.
* **In-Room Chat (Ephemeral):**
    * Users can send and receive real-time text messages within a room, visible to all current participants. Messages are **not persisted** in the database (ephemeral).
* **Leave Room Functionality:**
    * Users can explicitly leave a room from the `RoomPage` via a button, updating participant lists in real-time and navigating back to the dashboard.

---

## 🚀 Technologies Used

* **Backend:**
    * **Node.js:** JavaScript runtime environment.
    * **Express.js:** Fast, minimalist web framework for building APIs.
    * **PostgreSQL:** Robust relational database for structured data.
    * **`bcrypt`:** For secure password hashing.
    * **`jsonwebtoken` (JWT):** For stateless authentication.
    * **`dotenv`:** For managing environment variables locally.
    * **`node-cron`:** For scheduling automated room status updates.
    * **`socket.io`:** For real-time, bidirectional communication (WebSockets).
* **Frontend:**
    * **React.js:** JavaScript library for building dynamic user interfaces (component-based).
    * **Vite:** Fast build tool for React development.
    * **`react-router-dom`:** For client-side routing and navigation.
    * **`socket.io-client`:** Frontend library for real-time communication.
* **Deployment:**
    * **Render:** Cloud Platform-as-a-Service (PaaS) for hosting both the Node.js backend (Web Service) and the React frontend (Static Site), along with the PostgreSQL database (Managed Service).
* **Tools:**
    * **Git & GitHub:** Version control and project hosting.
    * **GitHub Projects (Kanban):** For agile project management and iterative task tracking.
    * **Postman/Insomnia:** For API testing.
    * **pgAdmin/DBeaver:** For PostgreSQL database management.
    * **Browser Developer Tools:** Essential for frontend debugging (Console, Network, Components).

---

## 📦 How to Run Locally

Follow these steps to set up and run Roomloop on your local machine:

### **Prerequisites**
* [Node.js](https://nodejs.org/en/download/) (LTS version recommended)
* [npm](https://www.npmjs.com/get-npm) (comes bundled with Node.js)
* [PostgreSQL](https://www.postgresql.org/download/) (and a GUI tool like pgAdmin or DBeaver)

### **1. Clone the Repository**
```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/roomloop-platform.git](https://github.com/YOUR_GITHUB_USERNAME/roomloop-platform.git)
cd roomloop-platform

