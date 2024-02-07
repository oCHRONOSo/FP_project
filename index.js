// Import necessary modules
const http = require("http").createServer();
const ssh2 = require("ssh2");
const fs = require("fs");
const path = require('path');
const pty = require("node-pty");
const os = require("os");
const io = require("socket.io")(http, { cors: { origin: "*" } });

// Determine the shell based on the operating system
const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

// Handle socket connections
io.on("connection", (socket) => {
  // Log the IP address of the connecting user
  const clientIpAddress = socket.handshake.address;
  console.log(`User connected from IP: ${clientIpAddress}`);
  let sftpconn = false;

  // Listen for requests to start an SSH connection
  socket.on("startSSHConnection", ({ ip, username, password, port, sshKeyContent, passphrase }) => {
    let sshConfig;
    let conn = new ssh2.Client();
    let ptyProcess;

    // Set up SSH configuration based on provided credentials
    if (!password) {
      sshConfig = { host: ip, port, username, privateKey: sshKeyContent, passphrase };
    } else {
      sshConfig = { host: ip, port, username, password };
    }

    // Handle SSH connection errors
    conn.on("error", (err) => {
      const errorMessage = err.message.includes("Encrypted private key detected")
        ? "Encrypted private OpenSSH key detected, but no passphrase provided."
        : "Error connecting via SSH. Check your credentials and try again.";
      console.error("SSH connection error:", err.message);
      socket.emit("ssh.error", errorMessage);
      socket.emit("ssh.status", "Error connecting via SSH.");
      conn.end();
    });

    // Upon successful SSH connection
    conn.on("ready", function () {
      sftpconn = true;
      socket.emit("ssh.success");
      socket.emit("ssh.status", "SSH connection successful!");
      console.log("SSH connection successful!");

      // Open a shell within the SSH connection
      conn.shell(function (err, stream) {
        if (err) {
          console.error("Error opening shell:", err.message);
          socket.emit("ssh.error", "Error opening shell. Please try again.");
          console.log("Error while opening SHELL");
          sftp = false;
          conn.end();
          return;
        }

        // Spawn a pseudo-terminal process
        ptyProcess = pty.spawn(shell, [], {
          name: "xterm-color",
          cols: 80,
          rows: 30,
          cwd: process.env.HOME,
          env: process.env,
        });

        // Handle errors in the PTY process
        ptyProcess.on("error", function (err) {
          console.error("Error spawning PTY process:", err.message);
          socket.emit("ssh.error", "Error spawning PTY process. Please try again.");
          console.log("Error PTY process");
        });

        // Relay data received from the SSH connection to the client
        stream.on("data", function (data) {
          io.emit("output", data.toString());
        });

        // Listen for client commands
        socket.on("start", () => {
          stream.write("clear \r");
        });

        socket.on("input", (data) => {
          stream.write(data);
        });

        // Execute a predefined command on the server
        socket.on("command", () => {
          const command = "apt install sudo";
          stream.write(command);
        });

        // If SFTP is enabled, handle file transfer operations
        if (sftpconn) {
          conn.sftp((sftpErr, sftp) => {
            if (sftpErr) {
              console.error("Error creating SFTP session:", sftpErr.message);
              return;
            }
            let script_path;
            // Listen for requests to find a script file
            socket.on('path', (input_name) => {
              try {
                script_path = findScriptPath("scripts/", input_name);
              } catch (error) {
                socket.emit("ssh.status", "error: script not found");
              }
            });

            let domain_sh;
            let folderName_sh;
            socket.on('configue_webserver', ({domain, folderName})=>{
              domain_sh = domain
              folderName_sh = folderName
              console.log(domain);
              console.log(folderName);
            }); 

            socket.on("copy", () => {
              const localFilePath = script_path;
              const remoteDestination = "./";
              try {
                
                sftp.fastPut(
                  localFilePath,
                  remoteDestination + "script.sh",
                  {},
                  (transferErr) => {
                    if (transferErr) {
                      console.error("Error during file transfer:", transferErr.message);
                      return;
                    }
                    console.log("File transfer complete!");
                    stream.write(`sleep 2 && chmod a+x script.sh && (echo ${password} | sudo -S ./script.sh ${domain_sh} ${folderName_sh} ) && rm script.sh \n`);       
                  }
                );
  
              } catch (error) {
                socket.emit("ssh.status", "error: unable to copy the code");
              }
            });

            
          });
          
        }
      });
    });

    // Handle keyboard-interactive authentication failure
    conn.on("keyboard-interactive", () => {
      console.error("Authentication failed. Check your credentials and try again.");
      socket.emit("ssh.error", "Authentication failed. Check your credentials and try again.");
      socket.emit("ssh.status", "Authentication failed.");
      conn.end();
    });

    // Attempt to establish an SSH connection
    socket.emit("ssh.status", "Attempting to connect...");
    console.log("Attempting to connect...");

    // Respond to keyboard-interactive authentication prompts
    conn.on("keyboard-interactive", (name, instructions, lang, prompts, finish) => {
      console.log("SSH keyboard-interactive authentication prompts:", prompts);
      finish([password]);
    });

    // Allow TCP/IP forwarding
    conn.on("tcpip", (info, accept, reject) => {
      console.log("TCP/IP forwarding requested:", info);
      accept();
    });

    // Accept SSH channel requests
    conn.on("request", (accept, reject, name, info) => {
      console.log("SSH channel request:", name, info);
      accept();
    });

    // Handle disconnection from the SSH server
    socket.on("disconnectSSH", () => {
      if (conn) {
        conn.end();
        sftp = false;
        socket.emit("ssh.status", "Disconnected");
        console.log("SSH connection disconnected.");
        conn = null;
      }
      if (ptyProcess) {
        ptyProcess.kill();
        ptyProcess = null;
        console.log("PTY process terminated.");
        
      }
      sftpconn = false;
    });

    // Attempt to establish the SSH connection
    try {
      conn.connect(sshConfig);
    } catch (error) {
      if (error.message.includes("Cannot parse privateKey")) {
        socket.emit("ssh.status", "Check your passphrase");
      }
    }
  });
});

// Start the HTTP server
http.listen(8080, () => console.log("Server listening on http://localhost:8080"));

// Function to recursively find a script file within a directory
function findScriptPath(folderPath, scriptName) {
  if (!fs.existsSync(folderPath)) {
    console.log('Folder does not exist');
    return;
  }
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      const subFolderPath = path.join(folderPath, file);
      const foundPath = findScriptPath(subFolderPath, scriptName);
      if (foundPath) return foundPath;
    } else {
      if (file === scriptName /* && file.endsWith('.sh') */ ) {
        console.log(filePath);
        return filePath;
      }
    }
  }
  return null;
}
