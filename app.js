// Establish WebSocket connection with the server
const socket = io("ws://localhost:8080");

// Initialize state variables
let isConnected = false;
let isTerminalOpen = false;
let isTerminalInitialized = false;
let term;
let sshKeyContent;
let newLength = 200;
let maxChar = 200
let fitAddon;
// Function to handle file upload for SSH key
function handleFile() {
  const fileInput = document.getElementById('sshkey');
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      sshKeyContent = e.target.result;
    };
    showMessage("Uploading successful");
    reader.readAsText(file);
  } else {
    showMessage('No file selected');
  }
}

// Initialize the terminal 
const initializeTerminal = () => {
  if (!isTerminalInitialized) {


    term = new Terminal({ cursorBlink: true, convertEol: true, theme: {
      background: '#0b0d0e',
      foreground: '#f8f8f2',
      cursor: '#f8f8f2',
      cursorAccent: '#f8f8f2',
      selection: '#44475a',
      black: '#282a36',
      red: '#ff5555',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      blue: '#bd93f9',
      magenta: '#ff79c6',
      cyan: '#8be9fd',
      white: '#f8f8f2',
      brightBlack: '#6272a4',
      brightRed: '#ff6e6e',
      brightGreen: '#69ff94',
      brightYellow: '#ffffa5',
      brightBlue: '#d6acff',
      brightMagenta: '#ff92df',
      brightCyan: '#a4ffff',
      brightWhite: '#ffffff'
    }});

    term.loadAddon(new WebLinksAddon.WebLinksAddon());
    fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    searchAddon = new SearchAddon.SearchAddon();
    term.loadAddon(searchAddon);

    term.open(document.getElementById('terminal-container'));
    fitAddon.fit();

    const resizeObserver = new ResizeObserver((entries) => {
      fitAddon.fit();
      //window.resizeTo(term.rows, term.cols);
      newrow = term.rows;
      newcol = term.cols;
      socket.emit('resize',{newrow,newcol})
      //console.log("Size changed",term.rows, term.cols);
    });
    resizeObserver.observe(document.getElementById('terminal-container'));

    term.onData((data) => socket.emit('input', data));

    socket.on('output', (data) => term.write(data));
    socket.emit('start');
    isTerminalInitialized = true;
  }
};

// Display message in the UI
function showMessage(text, duration = 2000) {
  const messageContainer = document.getElementById('message_container');
  const messageElement = document.getElementById('message');
  messageContainer.hidden = false;
  messageElement.innerHTML = text;
  setTimeout(() => {
    messageElement.innerHTML = '';
    messageContainer.hidden = true;
  }, duration);
}

// Connect to SSH server
function connectSSH() {
  if (isConnected) {
    showMessage("Already connected!");
    return;
  }
  const { value: ip } = document.getElementById('ip');
  const { value: username } = document.getElementById('username');
  const { value: password } = document.getElementById('password');
  const { value: passphrase } = document.getElementById('passphrase');
  const { value: port } = document.getElementById('port');
  socket.emit('startSSHConnection', { ip, username, password, port, sshKeyContent, passphrase });
  showMessage("Connecting to SSH...");
  socket.on("ssh.status", (status) => {
    showMessage(status);
    isConnected = status === "SSH connection successful!";
    if (!isTerminalInitialized) initializeTerminal();
    updateTerminalButtons();
  });
  openTerminal();
}

// Disconnect from SSH server
function disconnectSSH() {
  if (!isConnected) {
    showMessage("Not connected!");
    return;
  }
  term.dispose();
  term = null;
  document.getElementById('terminal-container').innerHTML = null;
  isTerminalInitialized = false;
  showMessage("Disconnecting from SSH...");
  isConnected = false;
  socket.emit('disconnectSSH');
  closeTerminal();
}

// Open the terminal
function openTerminal() {
  if (!isConnected) {
    showMessage("Cannot open terminal. Ensure SSH connection is established.");
    return;
  }
  if (isTerminalOpen) {
    showMessage("Terminal is already open.");
    return;
  }
  document.getElementById('terminal-container').hidden = false;
  isTerminalOpen = true;
  updateTerminalButtons();
}

// Close the terminal
function closeTerminal() {
  if (!isConnected) {
    showMessage("Cannot close terminal. Ensure SSH connection is established.");
    return;
  }
  if (!isTerminalOpen) {
    showMessage("Terminal is already closed");
    return;
  }
  document.getElementById('terminal-container').hidden = true;
  isTerminalOpen = false;
  updateTerminalButtons();
}

// Update state of terminal buttons
function updateTerminalButtons() {
  const openTerminalBtn = document.getElementById('open-terminal-btn');
  const closeTerminalBtn = document.getElementById('close-terminal-btn');
  openTerminalBtn.disabled = isConnected && isTerminalOpen;
  closeTerminalBtn.disabled = !isConnected || !isTerminalOpen;
}

// Send test command to the server
function testCommand() {
  socket.emit('command');
}

// Copy script to the server and configure web server
function testCopy(button) {
  const input_name = button;
  const domain = document.getElementById("domain").value;
  const folderName = document.getElementById("folder_name").value;
  socket.emit("path", input_name);
  socket.emit('copy');
  socket.emit('configue_webserver', {domain, folderName});
}

// Handle SSH error messages
socket.on("ssh.error", (errorMessage) => {
  showMessage(`Error: ${errorMessage}`);
  isConnected = false;
  updateTerminalButtons();
});

// Handle server disconnection
socket.on("disconnect", () => {
  showMessage("Server Disconnected");
  isConnected = false;
  isTerminalOpen = false;
  updateTerminalButtons();
});

// Toggle between dark and light themes
document.getElementById('flexSwitchCheckDefault').addEventListener('click', () => {
  document.documentElement.setAttribute('data-bs-theme', document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark');
});

makeTermFullScreen = function(){
  const element = document.getElementById('terminal-container');
  ;
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

exitFS = function() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  fitAddon();
}

 toggleFullScreen = function() {
  if (!document.fullscreenElement) {
    makeTermFullScreen();
  } else if (document.exitFullscreen) {
    exitFS();
  }
}


