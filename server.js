const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Eventos de Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Usuario conectado:', socket.id);

  socket.on('chat:message', (data) => {
    io.emit('chat:message', data);
  });

  socket.on('chat:typing', (data) => {
    socket.broadcast.emit('chat:typing', data);
  });

  socket.on('room:join', (room) => {
    socket.join(room);
    socket.to(room).emit('room:notification', `${socket.id} se unió a la sala ${room}`);
  });

  socket.on('room:leave', (room) => {
    socket.leave(room);
    socket.to(room).emit('room:notification', `${socket.id} salió de la sala ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Usuario desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
