const socket = io();

// Give random ID to the sender.
const myId = Math.random().toString(36).substring(2, 8);

// Listen for 'chat-message' event.
socket.on('chat-message', function ({ sender, text, timestamp }) {
  // Message text.
  const messageText = document.createElement('p');
  messageText.classList.add('message-text');
  messageText.textContent = text;
  
  // Message timestamp.
  const messageTime = document.createElement('p');
  messageTime.classList.add('message-time');
  if (sender === myId) messageTime.classList.add('my-message-time');
  messageTime.textContent = new Date(timestamp).toLocaleTimeString();

  // Wrap the text and timestamp.
  const message = document.createElement('li');
  message.classList.add('message');
  if (sender === myId) message.classList.add('my-message');
  message.appendChild(messageText);
  message.appendChild(messageTime);

  // Put the message on the html page.
  const messages = document.getElementById('messages');
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;  // Scroll to the last received message.
});

// Send a message.
document.getElementById('form').addEventListener('submit', function (e) {
  e.preventDefault();
  const input = document.getElementById('input');
  const text = input.value.trim();
  if (text) {
    const message = { text, sender: myId };
    socket.emit('chat-message', message);
    input.value = '';
  }
});