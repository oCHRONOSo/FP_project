const http = require("http").createServer();
const ssh2 = require("ssh2");
const fs = require("fs");
const path = require('path');
const pty = require("node-pty");
const os = require("os");
const io = require("socket.io")(http, { cors: { origin: "*" } });

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

io.on("connection", (socket) => {
  const clientIpAddress = socket.handshake.address;
  console.log(`User connected from IP: ${clientIpAddress}`);
  let sftp = false;

  socket.on("startSSHConnection", ({ ip, username, password, port, sshKeyContent, passphrase }) => {
    let sshConfig;
    let conn = new ssh2.Client();
    let ptyProcess;

    if (!password) {
      sshConfig = { host: ip, port, username, privateKey: sshKeyContent, passphrase };
    } else {
      sshConfig = { host: ip, port, username, password };
    }

    socket.emit("ssh.status", "Connecting to SSH...");
    conn.on("error", (err) => {
      const errorMessage = err.message.includes("Encrypted private key detected")
        ? "Encrypted private OpenSSH key detected, but no passphrase provided."
        : "Error connecting via SSH. Check your credentials and try again.";
      console.error("SSH connection error:", err.message);
      socket.emit("ssh.error", errorMessage);
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
          sftp = false;
          conn.end();
          return;
        }

        ptyProcess = pty.spawn(shell, [], {
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
          const command = "apt install sudo";
          stream.write(command);
        });

        if (sftp) {
          conn.sftp((sftpErr, sftp) => {
            if (sftpErr) {
              console.error("Error creating SFTP session:", sftpErr.message);
              return;
            }
            let script_path;
            socket.on('path', (input_name) => {
              try {
                script_path = findScriptPath("scripts/", input_name);
              } catch (error) {
                socket.emit("ssh.status", "error: script not found");
              }
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
                    sftp.end();
                  }
                );
                socket.on("configue_webserver", (domain) => {
                  stream.write(`chmod a+x script.sh && sleep 0.5 && (echo ${password} | sudo -S ./script.sh ${domain}) && rm script.sh\r`);
                });
              } catch (error) {
                socket.emit("ssh.status", "error: unable to copy the code");
              }
            });
          });
        }
      });
    });

    conn.on("keyboard-interactive", () => {
      console.error("Authentication failed. Check your credentials and try again.");
      socket.emit("ssh.error", "Authentication failed. Check your credentials and try again.");
      socket.emit("ssh.status", "Authentication failed.");
      conn.end();
    });

    socket.emit("ssh.status", "Attempting to connect...");
    console.log("Attempting to connect...");

    conn.on("keyboard-interactive", (name, instructions, lang, prompts, finish) => {
      console.log("SSH keyboard-interactive authentication prompts:", prompts);
      finish([password]);
    });

    conn.on("tcpip", (info, accept, reject) => {
      console.log("TCP/IP forwarding requested:", info);
      accept();
    });

    conn.on("request", (accept, reject, name, info) => {
      console.log("SSH channel request:", name, info);
      accept();
    });

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
    });

    try {
      conn.connect(sshConfig);
    } catch (error) {
      if (error.message.includes("Cannot parse privateKey")) {
        socket.emit("ssh.status", "Check your passphrase");
      }
    }
  });
});

http.listen(8080, () => console.log("Server listening on http://localhost:8080"));

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
      if (file === scriptName && file.endsWith('.sh')) {
        console.log(filePath);
        return filePath;
      }
    }
  }
  return null;
}
