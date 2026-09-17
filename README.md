 Real-Time Communication App

A full-stack real-time chat application built as part of the CodeAlpha Full Stack Internship (Task 4). Users can create and join password-protected chat rooms and communicate instantly using WebSockets.

>>.Features

- User authentication (login & register)
- Create chat rooms with password protection
- Join existing rooms using room password
- Real-time messaging using Socket.io
- Clean and responsive UI with smooth animations

>>.Tech Stack

- Frontend:** HTML, CSS, JavaScript
- Backend:** Node.js, Express.js
- Database:** MongoDB (Mongoose)
- Real-time Communication:** Socket.io
- Authentication:** JWT (JSON Web Token)


  >>. Project Structure
  >>backend/
├── middleware/
│ └── auth.js
├── models/
│ ├── Post.js
│ ├── Room.js
│ └── User.js
├── routes/
│ ├── auth.js
│ ├── posts.js
│ └── users.js
├── server.js
├── socket.js
├── .env.example


>>. Getting Started

>>.  Prerequisites
- Node.js installed
- MongoDB database (local or Atlas)

>>. Installation

1. Clone the repository
   Bash
   git clone (https://github.com/Aiman404/CodeAlpha_realtime-Comms.git)
   cd your-repo-name/backend


2. Install dependencies
bash
   npm install


3. Create a `.env` file in the backend folder based on `.env.example` and add your own values:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret


4. Run the server
bash
   npm start


5. Open the app in your browser at `http://localhost:5000` (or the port you set)

>>. How It Works

1. Users register/login to get authenticated.
2. A user can create a new chat room by setting a room name and password.
3. Other users join the room by entering the correct room password.
4. Messages are sent and received instantly using Socket.io.

>>. Author

Made by Aiman as part of the CodeAlpha Internship Program.
