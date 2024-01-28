// Import the 'http' module to create an HTTP server
const http = require("http").createServer();

// Import necessary modules for SSH functionality
const ssh2 = require("ssh2");
const fs = require("fs");
const pty = require("node-pty");
const os = require("os");

// Set up Socket.IO with CORS configuration
let io = require("socket.io")(http, {
  cors: { origin: "*" },
});

// Determine the default shell based on the operating system
const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

// Handle incoming Socket.IO connections
io.on("connection", (socket) => {
  // Log and display the IP address of the connected user
  const clientIpAddress = socket.handshake.address;
  console.log(`User connected from IP: ${clientIpAddress}`);

  let sftp = false;

  // Listen for SSH details from the client to start an SSH connection
  socket.on(
    "startSSHConnection",
    ({ ip, username, password, sshKeyContent, passphrase }) => {

      let sshConfig;

      const conn = new ssh2.Client();

      if (
        typeof password === "undefined" ||
        password === null ||
        password === ""
      ) {
        sshConfig = {
          host: ip,
          port: 22,
          username: username,
          privateKey: sshKeyContent,
        };

        if (passphrase) {
          sshConfig.passphrase = passphrase;
        }
      } else {
        sshConfig = {
          host: ip,
          port: 22,
          username: username,
          password: password,
        };
      }

      // Emit a status message when the server starts connecting
      socket.emit("ssh.status", "Connecting to SSH...");

      conn.on("error", (err) => {
        if (err.message.includes("Encrypted private key detected")) {
          // Emit an error indicating encrypted key without passphrase
          socket.emit("ssh.error", "Encrypted private OpenSSH key detected, but no passphrase provided.");
        } else {
          // Other SSH connection errors
          console.error("SSH connection error:", err.message);
          socket.emit("ssh.error", "Error connecting via SSH. Check your credentials and try again.");
        }
        socket.emit("ssh.status", "Error connecting via SSH.");
        conn.end();
      });

      conn.on("ready", function () {
        sftp = true;
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
            socket.emit(
              "ssh.error",
              "Error spawning PTY process. Please try again."
            );
            console.log("Error PTY process");
            // Handle the error or terminate the process
          });

          stream.on("data", function (data) {
            io.emit("output", data.toString());
          });

          socket.on("start", () => {
            stream.write("clear \r");
          });

          socket.on("input", (data) => {
            stream.write(data);
          });

          socket.on("command", () => {
            // command = '[ "$EUID" -ne 0 ] && echo "Please run this command as root" || { echo \'#!/bin/bash\' > empty_script.sh && chmod +x empty_script.sh; } && clear\r';
            command = "echo hola";
            stream.write(command);
          });

        });

        const localFilePath = "hola.sh";
        const remoteDestination = "./";

        socket.on("copy",() => {
            if (sftp) {
              conn.sftp((sftpErr, sftp) => {
                if (sftpErr) {
                  console.error("Error creating SFTP session:", sftpErr.message);
                  return;
                }
      
                sftp.fastPut(
                  localFilePath,
                  remoteDestination + "script.sh",
                  {},
                  (transferErr) => {
                    if (transferErr) {
                      console.error(
                        "Error during file transfer:",
                        transferErr.message
                      );
                      return;
                    }
      
                    console.log("File transfer complete!");
                  }
                );
              });
            }
            
          
          
        });
        
      });

      // Additional error handling for authentication failures
      conn.on("keyboard-interactive", () => {
        // Authentication failed
        console.error(
          "Authentication failed. Check your credentials and try again."
        );
        socket.emit(
          "ssh.error",
          "Authentication failed. Check your credentials and try again."
        );
        socket.emit("ssh.status", "Authentication failed.");
        conn.end();
      });

      // Emit a status message when the server is attempting to connect
      socket.emit("ssh.status", "Attempting to connect...");
      console.log("Attempting to connect...");

      conn.on(
        "keyboard-interactive",
        (name, instructions, lang, prompts, finish) => {
          // Log keyboard-interactive authentication prompts
          console.log(
            "SSH keyboard-interactive authentication prompts:",
            prompts
          );
          finish([password]);
        }
      );

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
        conn.end();
        sftp = false;
        socket.emit("ssh.status", "Disconnected");
        console.log("SSH connection disconnected.");
      });
      try {
        conn.connect(sshConfig);
      } catch (error) {
        if (error.message.includes("Cannot parse privateKey")) {
          socket.emit("ssh.status", "Check your passphrase")
        }
 
      }
      
    }
  );
});

// Start the HTTP server and listen on port 8080
http.listen(8080, () =>
  console.log("Server listening on http://localhost:8080")
);
