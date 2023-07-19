const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000', // Replace with your frontend server URL
    methods: ['GET', 'POST'],
  },
});


const rooms = [
  { id: 1, name: 'Room 1' },
  { id: 2, name: 'Room 2' },
  { id: 3, name: 'Room 3' },
  // Add more rooms as needed
];

const messages = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('message', (newMessage) => {
    const { roomId, user, content, timestamp } = newMessage;
    const message = { user, content, timestamp };
    messages[roomId] = [...(messages[roomId] || []), message];
    io.emit('message', { roomId, message });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

app.get('/messages/:roomId', (req, res) => {
  const { roomId } = req.params;
  const roomMessages = messages[roomId] || [];
  res.json(roomMessages);
});

app.post('/messages/:roomId', (req, res) => {
  const { roomId } = req.params;
  const { user, content, timestamp } = req.body;
  const newMessage = { user, content, timestamp };
  messages[roomId] = [...(messages[roomId] || []), newMessage];
  io.emit('message', { roomId, message: newMessage });
  res.sendStatus(200);
});

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});

//node server.js