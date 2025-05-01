require('dotenv').config();  // Load environment variables from '.env' file to the 'process.env' object so we can access them.

const express = require('express');
const http = require('node:http');
const socketIO = require('socket.io');
const path = require('node:path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 3000;

// Keep track of connected users.
let nextUserID = 0;
const users = [];

// Serve static files from the 'app' folder.
app.use(express.static(path.join(__dirname, '..', 'app')));

// Start the server.
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

function saveNewUser(socket) {
  ++nextUserID;
  users.push({ userID: nextUserID, socketID: socket.id });
}

function printUser(user) {
  console.log(`User ID: ${user.userID} | Socket ID: ${user.socketID}`);
}

// Listen for WebSocket 'connection' event.
io.on('connection', (socket) => {
  saveNewUser(socket);

  process.stdout.write('A user connected | ');  // Don't print new line at the end.
  printUser(users[users.length - 1]);

  // Send users online list.
  io.emit('users-online', users.map(({ userID }) => userID));

  socket.on('chat-message', text => {
    const { userID } = users.find(({ socketID }) => socketID === socket.id);
    const timestamp = new Date().toISOString();
    socket.broadcast.emit('chat-message', userID, text, timestamp);  // Emit the message to all other users.
  });  

  // The user is typing.
  socket.on('typing', () => {
    const { userID } = users.find(({ socketID }) => socketID === socket.id);
    socket.broadcast.emit('typing', userID);
  });

  /*
  Note: If you open a browser tab and reload the page very fast a couple of times, the users online array might have some users which are disconnected but are still in it.
  They resolve after about 30 seconds. 'Socket.IO' might have some disconnect timeout so maybe that's why the disconnect is not instantaneous (or there may be another reason idk?).
  */
  socket.on('disconnect', () => {
    const i = users.findIndex(({ socketID }) => socketID === socket.id);  // Find disconnected user.
    process.stdout.write('A user disconnected | ');  // Don't print new line at the end.
    printUser(users[i]);
    users.splice(i, 1);  // Remove user from online array.
    io.emit('users-online', users.map(({ userID }) => userID));
  });
});