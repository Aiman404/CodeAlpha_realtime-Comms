require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '5mb' }));   // room files travel as base64

// --- REST API (Task 2: social platform) ---
app.get('/api/health', (req, res) => res.json({ ok: true, time: Date.now() }));
app.use('/api/auth',  require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// --- Socket.io (Task 4: realtime rooms) ---
const io = new Server(server, { cors: { origin: process.env.CLIENT_ORIGIN || '*' } });
require('./socket')(io);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
