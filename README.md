
# Room Loop

> Roomloop is a full-stack web application designed for spontaneous, low-friction group interactions. It allows users to instantly create or join `rooms` for purposes like quick study sessions, brainstorming, or casual hangouts, without the need for formal invitations or scheduling.

- Spontaneous Connections: Create or join public/private rooms for drop-in events and instant meetups.

- Real-Time Interaction: Features an ephemeral in-room chat and a live participant list powered by WebSockets.

- Secure & Dynamic: Built with secure user authentication (JWT), password hashing, and protected routes.

- Room Discovery: An `Explore` page lets users discover and filter live or upcoming public rooms by topic.

- Automated Management: Rooms automatically transition between `scheduled`, `live`, and `closed` states based on their set times.

## Demo

![](/assets/demo.gif)


## Table of Contents

* [Tech Stack and Prerequisites](#tech-stack-and-prerequisites)
* [How to Install and Run the Project](#how-to-install-and-run-the-project)
* [How to Use the Project](#how-to-use-the-project)
* [Future Improvements](#future-improvements)
* [Acknowledgements](#acknowledgements)
* [License](#license)
## Tech Stack and Prerequisites

**Frontend:** React.js, Vite

**Backend:** Node.js, Express.js, PostgreSQL, Socket.IO

**Prerequisites** Postman, pgAdmin, Git



## How to Install and Run the Project

1. Clone the Repository
```
git clone https://github.com/aursalan/room-loop.git
cd room-loop
```

2. Backend Setup & Database
- Create your PostgreSQL database. 
```
#In psql or a GUI tool like pgAdmin
CREATE DATABASE roomloop_db;
```

- Make sure you are in the root of the project. 
```
psql -U your_postgres_user -d roomloop_db -f backend/database/init.sql
#Note: This command assumes your script is located at backend/database/init.sql Adjust the path as needed
```


- Navigate to the backend directory and install dependencies.
```
cd backend
npm install
```

- Create a .env file in the backend directory using `eg.env` and add your database credentials and a JWT secret.
```
DB_USER=your_postgres_user
DB_HOST=localhost
DB_DATABASE=roomloop_db
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_super_secret_key_for_tokens
```

3. Frontend Setup
```
cd frontend
npm install
```

4. Run the Application
Start both the backend server and the frontend development server.
```
# In the backend terminal
npm start

# In the frontend terminal
npm run dev
```




## How to Use the Project

- **Register & Login:** Create a new account or log in. You will be redirected to your personal dashboard.

- **Explore Rooms:** Navigate to the `Explore` page to see all public rooms that are live or starting_soon.

- **Create a Room:** From your dashboard, create a new room by providing details like a name, topic, and start/end times.

- **Join a Room:** Join any live public room from the Explore page or use a direct link/access code.

- **Interact:** Once inside, send messages in the real-time chat and see a live list of all participants.

- **Leave a Room:** Click the `Leave Room` button to exit and return to your dashboard.
##  Future Improvements

**Video & Audio Chat:** Integrate WebRTC for real-time video and audio communication.

**Persistent Chat History:** Add an option for room creators to save chat logs.

**User Profiles:** Implement enhanced user profiles with avatars and activity history.

**Friend System & Invites:** Allow users to add friends and send direct invitations to rooms.

**Advanced Search:** Add more powerful search and filtering options on the Explore page.
## Acknowledgements

 - [Node.js Documentation](https://nodejs.org/en/docs/)
 - [Express.js Documentation](https://expressjs.com/)
 - [React.js Documentation](https://www.google.com/search?q=https://reactjs.org/docs/getting-started.html)
 - [PostgreSQL Documentation](https://www.postgresql.org/docs/)
 - [Socket.IO Documentation](https://socket.io/docs/v4/)

## License
This project is licensed under the [MIT](LICENSE) License.
