const socket = io("ws://localhost:8080");
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
    reader.onload = (e) => {
      sshKeyContent = e.target.result;
    };
    showMessage("Uploading successful");
    reader.readAsText(file);
  } else {
    showMessage('No file selected');
  }
}

const initializeTerminal = () => {
  if (!isTerminalInitialized) {
    term = new Terminal({ cursorBlink: true, convertEol: true });
    term.open(document.getElementById('terminal-container'));
    term.onData((data) => socket.emit('input', data));
    socket.on('output', (data) => term.write(data));
    socket.emit('start');
    isTerminalInitialized = true;
  }
};

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

function updateTerminalButtons() {
  const openTerminalBtn = document.getElementById('open-terminal-btn');
  const closeTerminalBtn = document.getElementById('close-terminal-btn');
  openTerminalBtn.disabled = isConnected && isTerminalOpen;
  closeTerminalBtn.disabled = !isConnected || !isTerminalOpen;
}

function testCommand() {
  socket.emit('command');
}

function testCopy(button) {
  const input_name = button;
  const domain = document.getElementById("domain").value;
  socket.emit("path", input_name);
  socket.emit('copy');
  socket.emit('configue_webserver', domain);
}

socket.on("ssh.error", (errorMessage) => {
  showMessage(`Error: ${errorMessage}`);
  isConnected = false;
  updateTerminalButtons();
});

socket.on("disconnect", () => {
  showMessage("Server Disconnected");
  isConnected = false;
  isTerminalOpen = false;
  updateTerminalButtons();
});

document.getElementById('flexSwitchCheckDefault').addEventListener('click', () => {
  document.documentElement.setAttribute('data-bs-theme', document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark');
});
