// Create an HTTP server using the 'http' module
const http = require("http").createServer();

// Import necessary modules for SSH functionality
const ssh2 = require("ssh2");

const pty = require("node-pty");
const os = require("os");

// Set up Socket.IO with CORS configuration
const io = require("socket.io")(http, {
  cors: { origin: "*" },
});


const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

// Handle incoming Socket.IO connections
io.on("connection", (socket) => {
  // Log and display the IP address of the connected user
  const clientIpAddress = socket.handshake.address;
  console.log(`User connected from IP: ${clientIpAddress}`);

  // Listen for SSH details from the client to start an SSH connection
  socket.on("startSSHConnection", ({ ip, username, password }) => {
    const sshConfig = {
      host: ip,
      port: 22,
      username: username,
      password: password,
    };

    const conn = new ssh2.Client();

    // Emit a status message when the server starts connecting
    socket.emit("ssh.status", "Connecting to SSH...");

    conn.on("error", (err) => {
      console.error("SSH connection error:", err.message);
      socket.emit("ssh.error", "Error connecting via SSH. Check your credentials and try again.");
      socket.emit("ssh.status", "Error connecting via SSH.");
      conn.end();
    });

    conn.on("ready", function () {
      socket.emit("ssh.success");
      socket.emit("ssh.status", "SSH connection successful!");
      console.log("SSH connection successful!");

      conn.shell(function (err, stream) {
        if (err) {
          console.error("Error opening shell:", err.message);
          socket.emit("ssh.error", "Error opening shell. Please try again.");
          console.log("Error while opening SHELL");
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
          socket.emit("ssh.error", "Error spawning PTY process. Please try again.");
          console.log("Error PTY process");
          // Handle the error or terminate the process
        });
        
        stream.on("data", function (data) {
          io.emit("output", data.toString());
        });
  
        /* stream.on("close", function () {
          stream.end();
          conn.end();
        }); */
        socket.on("start", () => {
          stream.write("clear \r")
        });

        socket.on("input", (data) => {
          stream.write(data);
        });

        socket.on("command", () => {
          // command = '[ "$EUID" -ne 0 ] && echo "Please run this command as root" || { echo \'#!/bin/bash\' > empty_script.sh && chmod +x empty_script.sh; } && clear\r'; 
          // command = "echo hola\r"
          stream.write(command);
        });
        socket.on("closeTerminal", () => {
          stream.end();
          //conn.end();
        });
      });

    });

    // Additional error handling for authentication failures
    conn.on("keyboard-interactive", () => {
      // Authentication failed
      console.error("Authentication failed. Check your credentials and try again.");
      socket.emit("ssh.error", "Authentication failed. Check your credentials and try again.");
      socket.emit("ssh.status", "Authentication failed.");
      conn.end();
    });

    // Emit a status message when the server is attempting to connect
    socket.emit("ssh.status", "Attempting to connect...");
    console.log("Attempting to connect...");

    conn.on("banner", (banner) => {
      // Log the SSH banner received from the server
      console.log("SSH banner received:", banner.toString());
    });

    conn.on("keyboard-interactive", (name, instructions, lang, prompts, finish) => {
      // Log keyboard-interactive authentication prompts
      console.log("SSH keyboard-interactive authentication prompts:", prompts);
      finish([password]);
    });

    conn.on("tcpip", (info, accept, reject) => {
      // Log the TCP/IP forwarding request
      console.log("TCP/IP forwarding requested:", info);
      accept();
    });

    conn.on("request", (accept, reject, name, info) => {
      // Log other SSH channel requests
      console.log("SSH channel request:", name, info);
      accept();
    });

    socket.on("disconnectSSH", () => {
      socket.emit("ssh.status", "Disconnected");
      console.log("SSH connection disconnected.");
      conn.end();
    });
    conn.connect(sshConfig);

    

  });
});

// Start the HTTP server and listen on port 8080
http.listen(8080, () => console.log("Server listening on http://localhost:8080"));
