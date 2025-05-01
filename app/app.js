const socket = io();

// Add message to the html page.
function addMessage(text, timestamp, isMyMessage, userID) {
  const messageText = document.createElement('p');
  const messageTime = document.createElement('p');
  const message = document.createElement('div');  // Wraps the text and time.
  const userMessage = document.createElement('li');  // Wraps message and user icon.

  messageText.classList.add('message-text');
  messageText.textContent = text;

  messageTime.classList.add('message-time');
  messageTime.textContent = new Date(timestamp).toLocaleTimeString();

  message.classList.add('message');
  message.appendChild(messageText);
  message.appendChild(messageTime);

  userMessage.classList.add('user-message');
  userMessage.appendChild(message);

  if (isMyMessage) {
    messageTime.classList.add('my-message-time');
    message.classList.add('my-message');
  } else {
    // Put user icon.
    const userIcon = document.createElement('p');
    userIcon.classList.add('user-icon');
    userIcon.textContent = userID;
    userMessage.prepend(userIcon);
  }

  // Put it in the html page.
  const messages = document.getElementById('messages');
  messages.appendChild(userMessage);
  messages.scrollTop = messages.scrollHeight;  // Scroll to the last received message.
}

function removeAllButFirstChild(elem) {
  while (elem.children[1]) {
    elem.removeChild(elem.children[1])
  }
}

// Listen for chat messages from other users.
socket.on('chat-message', (userID, text, timestamp) => {
  addMessage(text, timestamp, false, userID);
});

// Receives an array of user IDs which are online and updates the page.
socket.on('users-online', userIDs => {
  removeAllButFirstChild(document.getElementById('online-bar'));

  // Add to the page.
  userIDs.forEach((id) => {
    const userIcon = document.createElement('p');
    userIcon.classList.add('user-icon', 'user-icon-online');
    userIcon.textContent = id;

    document.getElementById('online-bar').appendChild(userIcon);
  });

});

// A user is typing.
let typingTimeout;
socket.on('typing', userID => {
  const tb = document.getElementById('typing-bar');
  if (tb.children[0]) tb.removeChild(tb.children[0]);

  const p = document.createElement('p');
  p.classList.add('typing-text');
  p.textContent = `${userID} is typing...`;
  tb.appendChild(p);

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() =>  { if (tb.children[0]) tb.removeChild(tb.children[0]); }, 2000);
});

// Send a message.
document.getElementById('form').addEventListener('submit', function (e) {
  e.preventDefault();
  const input = document.getElementById('input');
  const text = input.value.trim();
  if (text) {
    socket.emit('chat-message', text);
    addMessage(text, new Date().toISOString(), true);
    input.value = '';
  }
});

// Tell the server the user is typing.
document.getElementById('form').addEventListener('input', () => {
  socket.emit('typing');
});