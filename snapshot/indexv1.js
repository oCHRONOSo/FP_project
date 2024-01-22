// Create an HTTP server using the 'http' module
const http = require("http").createServer();

// Import necessary modules for terminal and SSH functionality
const pty = require("node-pty");
const os = require("os");
const ssh2 = require("ssh2");

// Set up Socket.IO with CORS configuration
const io = require("socket.io")(http, {
  cors: { origin: "*" },
});

// Determine the appropriate shell based on the operating system
const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

// Handle incoming Socket.IO connections
io.on("connection", (socket) => {
  // Listen for SSH details from the client to start a terminal session
  // Inside the "startTerminal" event handler
  socket.on("startTerminal", ({ ip, username, password }) => {
    const sshConfig = {
      host: ip,
      port: 22,
      username: username,
      password: password,
    };
  
    const conn = new ssh2.Client();
  
    conn.on("error", (err) => {
      console.error("SSH connection error:", err.message);
      socket.emit("terminal.error", "Error connecting via SSH. Check your credentials and try again.");
      conn.end();
    });
  
    conn.on("ready", function () {
      conn.shell(function (err, stream) {
        if (err) {
          console.error("Error opening shell:", err.message);
          socket.emit("terminal.error", "Error opening shell. Please try again.");
          conn.end();
          return;
        }
  
        var ptyProcess = pty.spawn(shell, [], {
          name: "xterm-color",
          cols: 80,
          rows: 30,
          cwd: process.env.HOME,
          env: process.env,
        });
  
        ptyProcess.on("error", function (err) {
          console.error("Error spawning PTY process:", err.message);
          socket.emit("terminal.error", "Error spawning PTY process. Please try again.");
          // Handle the error or terminate the process
        });
  
        stream.on("data", function (data) {
          io.emit("terminal.incomingData", data.toString());
        });
  
        stream.on("close", function () {
          stream.end();
          conn.end();
        });
  
        socket.on("terminal.keystroke", (data) => {
          stream.write(data);
        });
  
        socket.on("close", () => {
          stream.end();
          conn.end();
        });
      });
    });
  
    // Additional error handling for authentication failures
    conn.on("keyboard-interactive", () => {
      // Authentication failed
      console.error("Authentication failed. Check your credentials and try again.");
      socket.emit("terminal.error", "Authentication failed. Check your credentials and try again.");
      conn.end();
    });
  
    conn.connect(sshConfig);
  
    socket.on("disconnect", () => {
      conn.end();
    });
  });
});

// Start the HTTP server and listen on port 8080
http.listen(8080, () => console.log("listening on http://localhost:8080"));
