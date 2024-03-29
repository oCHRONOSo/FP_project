let socket = io("ws://localhost:8080");
let isConnected = false;
let isTerminalOpen = false;
let isTerminalInitialized = false;
let term;
let sshKeyContent;

function handleFile() {
  const fileInput = document.getElementById('sshkey');

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      sshKeyContent = e.target.result;
      
    };
    showMessage("Uploading successful");
    reader.readAsText(file);
    
  } else {
    showMessage('No file selected');
  }
}

const initializeTerminal = () => {

// Initialize terminal on page load
  term = new Terminal({
    cursorBlink: true,
  });
  term.open(document.getElementById('terminal-container'));

  term.onData((data) => {
    // Send user input from the terminal to the server
    socket.emit('input', data);
  });

  socket.on('output', (data) => {
    // Display output received from the server in the terminal
    term.write(data);
  });
  socket.emit('start');
  isTerminalInitialized = true;
  
};

 // Call the function to initialize the terminal on page load

function showMessage(text, duration = 2000) {

  const messageContainer = document.getElementById('message_container');
  const messageElement = document.getElementById('message');
  messageContainer.hidden = false;
  messageElement.innerHTML = text;

  // Pause for the specified duration and then clear the message
  setTimeout(() => {
    messageElement.innerHTML = '';
    messageContainer.hidden = true;
  }, duration);
}

function connectSSH() {
  if (isConnected) {
    showMessage("Already connected!");
    return;
  }

  const ip = document.getElementById('ip').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const passphrase = document.getElementById('passphrase').value;
  //socket.emit('sshkey',sshKeyContent);
  socket.emit('startSSHConnection', { ip, username, password, sshKeyContent, passphrase});
  //console.log(sshKeyContent);
  
  // Show connecting status
  showMessage("Connecting to SSH...");

  // Handle the connection status messages from the server
  socket.on("ssh.status", (status) => {
    showMessage(status);

    // Update isConnected flag based on the status
    isConnected = status === "SSH connection successful!";
    updateTerminalButtons();
  });
}

function disconnectSSH() {
  closeTerminal();
  if (!isConnected) {
    showMessage("Not connected!");
    return;
  }

  socket.emit('disconnectSSH');
  showMessage("Disconnecting from SSH...");
  isConnected = false;
  
}

function openTerminal() {
  if (!isConnected || isTerminalOpen) {
    showMessage("Cannot open terminal. Ensure SSH connection is established and terminal is not already open.");
    return;
  }

  // Logic to open the terminal (if needed)
  if (!isTerminalInitialized) {
    initializeTerminal(); // Initialize the terminal if not already initialized
  }
  const terminalContainer = document.getElementById('terminal-container');
  if (terminalContainer) {
    terminalContainer.hidden = false ; // Clear the terminal content
  } else {
    showMessage("Terminal container or terminal element not found.");
  }
  
  // Set isTerminalOpen to true
  isTerminalOpen = true;

  // Disable "Open Terminal" button and enable "Close Terminal" button
  updateTerminalButtons();
}

function closeTerminal() {
  if (!isConnected || !isTerminalOpen) {
    showMessage("Cannot close terminal. Ensure SSH connection is established and terminal is open.");
    return;
  }


  const terminalContainer = document.getElementById('terminal-container');

  if (terminalContainer) {
    terminalContainer.hidden = true ; // Clear the terminal content
  } else {
    showMessage("Terminal container or terminal element not found.");
  }

  // Set isTerminalOpen to false
  isTerminalOpen = false;

  // Enable "Open Terminal" button and disable "Close Terminal" button
  updateTerminalButtons();
}

function updateTerminalButtons() {
  const openTerminalBtn = document.getElementById('open-terminal-btn');
  const closeTerminalBtn = document.getElementById('close-terminal-btn');

  if (isConnected && isTerminalOpen) {
    openTerminalBtn.disabled = true;
    closeTerminalBtn.disabled = false;
  } else {
    openTerminalBtn.disabled = false;
    closeTerminalBtn.disabled = true;
  }
}

function testCommand() {
  socket.emit('command');
}
function testCopy(){
  socket.emit('copy');
}
socket.on("ssh.error", (errorMessage) => {
  showMessage(`Error: ${errorMessage}`);
  isConnected = false; // Reset the connection status on error

  // Disable terminal control buttons
  updateTerminalButtons();
});

socket.on("disconnect", () => {
  showMessage("Server Disconnected");
  isConnected = false; // Reset the connection status on disconnection

  // Reset terminal status and update buttons
  isTerminalOpen = false;
  updateTerminalButtons();
});
