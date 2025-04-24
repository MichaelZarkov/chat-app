const express = require('express');
const http = require('node:http');
const socketIO = require('socket.io');
const path = require('node:path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the 'app' folder.
app.use(express.static(path.join(__dirname, '..', 'app')));

// Start the server.
const PORT = process.env.PORT || 3000;  // Should make an 'env' file.
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Listen for WebSocket 'connection' event.
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for 'chat-message' event.
  /*
    Note that 'chat-message' is the name of the event so for things to work, the client has to emit with name
    'chat-message' like so: socket.emit('chat-message', clientMessage)
  */
  socket.on('chat-message', ({ sender, text }) => {
    const message = {
      sender,
      text, 
      timestamp: new Date().toISOString()
    };
    io.emit('chat-message', message);  // Emit to all connected sockets.
  });  

  // Listen for 'disconnect' event.
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});