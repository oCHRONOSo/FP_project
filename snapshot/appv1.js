const socket = io("ws://localhost:8080");

function createTerminalElement() {
  const terminalContainer = document.getElementById('terminal-container');
  const terminalElement = document.getElementById('terminal');

  if (!terminalElement) {
    const terminalDiv = document.createElement('div');
    terminalDiv.id = 'terminal';
    terminalContainer.appendChild(terminalDiv);
  }

  return document.getElementById('terminal');
}

function initializeTerminal(term) {
  socket.on("terminal.incomingData", (data) => {
    term.write(data);
  });

  term.onData((data) => {
    socket.emit("terminal.keystroke", data);
  });
}

function displayErrorMessage(errorMessage) {
  // Handle the error on the client side
  console.error("Server error:", errorMessage);

  // Display the error message to the user
  alert("Server error: " + errorMessage);
  
  // Close the terminal on error
  closeTerminal();
}

function createTerminal() {
  const terminal = createTerminalElement();
  const term = new Terminal();
  term.open(terminal);
  initializeTerminal(term);
}

socket.on("terminal.error", displayErrorMessage);

function startTerminal() {
  const terminalElement = document.getElementById('terminal');
  
  if (terminalElement.innerHTML.trim() === '') {
    // Display loading spinner or other feedback to indicate terminal startup
    createTerminal();
    
    const ip = document.getElementById('ip').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    socket.emit('startTerminal', { ip, username, password });
  } else {
    showMessage("terminal already in use");
  }
}
function showMessage(text, duration = 2000) {
  var messageElement = document.getElementById('message');
  messageElement.innerHTML = text;

  // Pause for the specified duration and then clear the message
  setTimeout(function () {
    messageElement.innerHTML = '';
  }, duration);
}

function closeTerminal() {
  socket.emit('close');
  removeTerminal();
}

function removeTerminal() {
  const terminalContainer = document.getElementById('terminal-container');
  const terminalElement = document.getElementById('terminal');

  if (terminalContainer && terminalElement) {
    terminalElement.innerHTML = ''; // Clear the terminal content
  } else {
    console.error("Terminal container or terminal element not found.");
  }
}
