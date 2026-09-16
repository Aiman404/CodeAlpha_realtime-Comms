const bcrypt = require('bcryptjs');
const Room = require('./models/Room');

// Who is currently in each room: { roomCode: Map(socketId -> name) }
const presence = new Map();

function roster(code) {
  return Array.from((presence.get(code) || new Map()).values());
}

function broadcastRoster(io, code) {
  io.to(code).emit('participants', roster(code));
}

module.exports = function attachSockets(io) {
  io.on('connection', socket => {

    // ---- create a password-protected room ----
    socket.on('create-room', async ({ name, room, password }) => {
      try {
        const code = (room || '').toLowerCase().trim();
        if (!code || !password || password.length < 4)
          return socket.emit('room-error', { message: 'Room code and a password of 4+ characters are required.' });

        if (await Room.findOne({ code }))
          return socket.emit('room-error', { message: 'That room code already exists. Join it instead.' });

        const hash = await bcrypt.hash(password, 10);
        await Room.create({ code, password: hash, owner: name, messages: [], files: [] });
        await enter(socket, code, name);
      } catch (e) {
        socket.emit('room-error', { message: 'Could not create the room. Try again.' });
      }
    });

    // ---- join an existing room with its password ----
    socket.on('join-room', async ({ name, room, password }) => {
      try {
        const code = (room || '').toLowerCase().trim();
        const doc = await Room.findOne({ code });
        if (!doc) return socket.emit('room-error', { message: 'No room with that code.' });

        const ok = await bcrypt.compare(password || '', doc.password);
        if (!ok) return socket.emit('room-error', { message: 'Wrong password for this room.' });

        await enter(socket, code, name, doc);
      } catch (e) {
        socket.emit('room-error', { message: 'Could not join the room. Try again.' });
      }
    });

    async function enter(socket, code, name, doc) {
      socket.join(code);
      socket.data.room = code;
      socket.data.name = name;

      if (!presence.has(code)) presence.set(code, new Map());
      presence.get(code).set(socket.id, name);

      socket.emit('room-ok', { room: code });

      const room = doc || await Room.findOne({ code });
      socket.emit('chat-history', room.messages || []);
      socket.emit('file-history', room.files || []);
      broadcastRoster(io, code);
      socket.to(code).emit('chat-message', {
        id: 'sys-' + Date.now(), name: 'Room', text: `${name} joined`, ts: Date.now()
      });
    }

    // ---- chat: each message is pushed, never overwritten ----
    socket.on('chat-message', async ({ room, id, name, text, ts }) => {
      if (socket.data.room !== room) return;
      const msg = { id, name, text: String(text).slice(0, 400), ts: ts || Date.now() };
      await Room.updateOne({ code: room }, { $push: { messages: msg } });
      io.to(room).emit('chat-message', msg);   // sender included, so it shows once for everyone
    });

    // ---- file sharing ----
    socket.on('share-file', async ({ room, ...file }) => {
      if (socket.data.room !== room) return;
      if (!file.data || file.size > 2 * 1024 * 1024) return;
      await Room.updateOne({ code: room }, { $push: { files: file } });
      io.to(room).emit('file-shared', file);
    });

    // ---- whiteboard ----
    socket.on('draw', data => socket.to(data.room).emit('draw', data));
    socket.on('board-clear', ({ room }) => socket.to(room).emit('board-clear'));

    // ---- WebRTC signalling (for real peer-to-peer video) ----
    socket.on('webrtc-offer',  d => socket.to(d.target).emit('webrtc-offer',  { from: socket.id, sdp: d.sdp }));
    socket.on('webrtc-answer', d => socket.to(d.target).emit('webrtc-answer', { from: socket.id, sdp: d.sdp }));
    socket.on('webrtc-ice',    d => socket.to(d.target).emit('webrtc-ice',    { from: socket.id, candidate: d.candidate }));

    // ---- leaving ----
    const leave = () => {
      const code = socket.data.room;
      if (!code) return;
      const map = presence.get(code);
      if (map) { map.delete(socket.id); if (!map.size) presence.delete(code); }
      socket.to(code).emit('chat-message', {
        id: 'sys-' + Date.now(), name: 'Room', text: `${socket.data.name} left`, ts: Date.now()
      });
      broadcastRoster(io, code);
    };
    socket.on('leave-room', leave);
    socket.on('disconnect', leave);
  });
};
