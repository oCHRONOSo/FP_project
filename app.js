const socket = io("ws://localhost:8080");
let isConnected = false;
let isTerminalOpen = false;
let isTerminalInitialized = false;
let term;
let sshKeyContent;

// get the ssh key
function handleFile() {
  const fileInput = document.getElementById('sshkey');

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      sshKeyContent = e.target.result;

      // Send the SSH key content to the server using WebSocket
      
    };
    console.log("sent");
    reader.readAsText(file);
    
  } else {
    console.error('No file selected');
  }
}
// Initialize terminal on page load
const initializeTerminal = () => {
  term = new Terminal();
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
  const messageElement = document.getElementById('message');
  messageElement.innerHTML = text;

  // Pause for the specified duration and then clear the message
  setTimeout(() => {
    messageElement.innerHTML = '';
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

  //socket.emit('sshkey',sshKeyContent);
  socket.emit('startSSHConnection', { ip, username, password,sshKeyContent});
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
  if (!isConnected) {
    showMessage("Not connected!");
    return;
  }

  socket.emit('disconnectSSH');
  showMessage("Disconnecting from SSH...");
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
  showMessage("Opening terminal...");
  
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

  //socket.emit('closeTerminal');
  // Logic to close the terminal (if needed)
  showMessage("Closing terminal...");

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
socket.on("ssh.error", (errorMessage) => {
  showMessage(`Error: ${errorMessage}`);
  isConnected = false; // Reset the connection status on error

  // Disable terminal control buttons
  updateTerminalButtons();
});

socket.on("disconnect", () => {
  showMessage("Disconnected");
  isConnected = false; // Reset the connection status on disconnection

  // Reset terminal status and update buttons
  isTerminalOpen = false;
  updateTerminalButtons();
});
