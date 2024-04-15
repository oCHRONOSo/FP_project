// Import necessary modules
//const http = require("http").createServer();
const http = require('http');
const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const server = http.createServer(app);


const ssh2 = require("ssh2");
const { Client } = require('ssh2');
const fs = require("fs");
const path = require('path');
// const pty = require("node-pty");
const os = require("os");
const io = require("socket.io")(server, { cors: { origin: "*" } });
const mysql = require('mysql');
const exp = require('constants');

// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/client/index.html');
// });

app.use('/static', express.static('node_modules'));
app.use('/js', express.static(__dirname + "/public/js"));
app.use('/scss', express.static(__dirname + "/public/scss/"));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'html');


app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
// Initialize MySQL connection
const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'usuario',
  password: 'usuario',
  database: 'db_conn'
});

dbConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

function sendRecentconn(socket) {
  const query = `
SELECT ip, port, username, password
FROM connections
ORDER BY last_connection DESC
LIMIT 10
`;

dbConnection.query(query, (err, results) => {
  if (err) {
    console.log('Error fetching recent connections from MySQL:', err);
    return;
  }
  
  // Emit the recent connections to the client
  socket.emit('recentConnections', results);
  console.log("DB results sent");
});
}


// Handle socket connections
io.on("connection", (socket) => {

  // send recent connections
  sendRecentconn(socket);

  // Log the IP address of the connecting user
  const clientIpAddress = socket.handshake.address;
  console.log(`User connected from IP: ${clientIpAddress}`);
  let sftpconn = false;

  // Listen for requests to start an SSH connection
  socket.on("startSSHConnection", ({ ip, username, password, port, sshKeyContent, passphrase }) => {


    
    
    let sshConfig ;
    const conn = new Client();
    //let ptyProcess;

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

      //Database data insert
      const insertQuery = `
      INSERT INTO connections (ip, port, username, password, last_connection)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE 
      ip = VALUES(ip),
      port = VALUES(port),
      username = VALUES(username),
      password = VALUES(password),
      last_connection = CURRENT_TIMESTAMP
      ;
      `;

      const values = [ip, port, username, password];
    
      dbConnection.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error('Error storing connection information to MySQL:', err);
          return;
        }
        console.log('Connection information stored in MySQL');
      });

      sendRecentconn(socket);
      
      socket.emit("ssh.success");
      socket.emit("ssh.status", "SSH connection successful!");
      console.log("SSH connection successful!");


      // Open a shell within the SSH connection
      conn.shell({ pty: true }, function (err, shellStream) {
        // Determine the shell based on the operating system
        const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
        //console.log(shell);
        let stream = shellStream;
        
        socket.on('resize',({newrow,newcol})=>{
          stream.setWindow(newrow,newcol);
        });

        if (err) {
          console.error("Error opening shell:", err.message);
          socket.emit("ssh.error", "Error opening shell. Please try again.");
          console.log("Error while opening SHELL");
          sftp = false;
          conn.end();
          return;
        }

        socket.on('closeshell',()=>{
          stream.write("echo shell");
        });
        /*         // Spawn a pseudo-terminal process
        ptyProcess = pty.spawn(shell, [], {
          name: "xterm-color",
          cols: 80,
          rows: 30,
          cwd: process.env.HOME,
          env: process.env
        });

        // Handle errors in the PTY process
        ptyProcess.on("error", function (err) {
          console.error("Error spawning PTY process:", err.message);
          socket.emit("ssh.error", "Error spawning PTY process. Please try again.");
          console.log("Error PTY process");
        }); */

        // Relay data received from the SSH connection to the client
        stream.on("data", function (data) {
          socket.emit("output", data.toString());
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
            let isSecure_sh;
            let wp_folderName_sh;
            let dbhost_sh;
            let dbname_sh;
            let dbuser_sh;
            let dbpassword_sh;
            let dns_domain_sh;
            let dns_ip_sh;
            let dns_conf_file_sh;
            let recordType_sh;
            let value1_sh;
            let value2_sh;
            let interfaceName_sh;
            let subnetIP_sh;
            let subnetMask_sh;
            let dhcpRangeStart_sh;
            let dhcpRangeEnd_sh;
            let gatewayIP_sh;
            let dnsIP_sh;


            socket.on('configue_webserver', ({ domain, folderName, isSecure }) => {
              domain_sh = domain
              folderName_sh = folderName
              isSecure_sh = isSecure.toString();
              console.log(domain);
              console.log(folderName);
              console.log(isSecure_sh);
            });

            socket.on('configue_wp', (wp_folderName) => {
              wp_folderName_sh = wp_folderName
              console.log(wp_folderName);
            });

            socket.on('configue_db', ({ dbname, dbuser, dbhost, dbpassword }) => {
              dbname_sh = dbname
              dbuser_sh = dbuser
              dbhost_sh = dbhost
              dbpassword_sh = dbpassword
              console.log(dbname);

            });

            socket.on('configue_dns', ({ dns_domain, dns_ip }) => {
              dns_domain_sh = dns_domain
              dns_ip_sh = dns_ip
            });

            socket.on('configue_dns_record', ({dns_conf_file, recordType, value1, value2}) => {
              dns_conf_file_sh = dns_conf_file
              recordType_sh = recordType
              value1_sh = value1
              value2_sh = value2
            });

            socket.on('configue_dhcp', ({ interfaceName, subnetIP, subnetMask, dhcpRangeStart, dhcpRangeEnd, gatewayIP, dnsIP }) => {

              interfaceName_sh = interfaceName;
              subnetIP_sh = subnetIP;
              subnetMask_sh = subnetMask;
              dhcpRangeStart_sh = dhcpRangeStart;
              dhcpRangeEnd_sh = dhcpRangeEnd;
              gatewayIP_sh = gatewayIP;
              dnsIP_sh = dnsIP;
          
          });
          
            function copy_conf(command="echo 'transfer complete' \n") {
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
                    stream.write(command)
                  });

              } catch (error) {
                socket.emit("ssh.status", "error: unable to copy the code");
              }

            } 

            socket.on("copy", () => {
              copy_conf();
            });

            socket.on("copy_install", () => {
              copy_conf(`sleep 2 && chmod a+x script.sh && (echo ${password} | sudo -S ./script.sh && rm script.sh ) || ( echo "Using root instead of sudo ..." && source /etc/profile && su - -c "$(pwd)/script.sh" && rm script.sh) \n`);
            });

            socket.on("copy_webserver", () => {
              copy_conf(`sleep 2 && chmod a+x script.sh && (echo ${password} | sudo -S ./script.sh ${domain_sh} ${folderName_sh} ${isSecure_sh} && rm script.sh ) || ( echo "Using root instead of sudo ..." && source /etc/profile && su - -c "$(pwd)/script.sh ${domain_sh} ${folderName_sh} ${isSecure_sh}" && rm script.sh) \n`);
            });

            socket.on("copy_wp", () => {
              copy_conf(`sleep 2 && chmod a+x script.sh && (echo ${password} | sudo -S ./script.sh ${wp_folderName_sh} && rm script.sh ) || ( echo "Using root instead of sudo ..." && source /etc/profile && su - -c "$(pwd)/script.sh ${wp_folderName_sh}" && rm script.sh) \n`);
            });

            socket.on("copy_db", () => {
              copy_conf(`sleep 2 && chmod a+x script.sh && (echo ${password} | sudo -S ./script.sh ${dbname_sh} ${dbuser_sh} ${dbpassword_sh} ${dbhost_sh} && rm script.sh ) || ( echo "Using root instead of sudo ..." && source /etc/profile && su - -c "$(pwd)/script.sh ${dbname_sh} ${dbuser_sh} ${dbpassword_sh} ${dbhost_sh} " && rm script.sh) \n`);
            });

            socket.on("copy_dns", () => {
              copy_conf(`sleep 2 && chmod a+x script.sh && (echo ${password} | sudo -S ./script.sh ${dns_ip_sh} ${dns_domain_sh}  && rm script.sh ) || ( echo "Using root instead of sudo ..." && source /etc/profile && su - -c "$(pwd)/script.sh ${dns_ip_sh} ${dns_domain_sh}  " && rm script.sh) \n`);
            });

            socket.on("copy_dns_record", () => {
              copy_conf(`sleep 2 && chmod a+x script.sh && (echo ${password} | sudo -S ./script.sh ${dns_conf_file_sh} ${recordType_sh} ${value1_sh} ${value2_sh}  && rm script.sh ) || ( echo "Using root instead of sudo ..." && source /etc/profile && su - -c "$(pwd)/script.sh ${dns_conf_file_sh} ${recordType_sh} ${value1_sh} ${value2_sh} " && rm script.sh) \n`);
            });

            socket.on("copy_dhcp", () => {
              copy_conf(`sleep 2 && chmod a+x script.sh && (echo ${password} | sudo -S ./script.sh ${interfaceName_sh} ${subnetIP_sh} ${subnetMask_sh} ${dhcpRangeStart_sh} ${dhcpRangeEnd_sh} ${gatewayIP_sh} ${dnsIP_sh}  && rm script.sh ) || ( echo "Using root instead of sudo ..." && source /etc/profile && su - -c "$(pwd)/script.sh ${interfaceName_sh} ${subnetIP_sh} ${subnetMask_sh} ${dhcpRangeStart_sh} ${dhcpRangeEnd_sh} ${gatewayIP_sh} ${dnsIP_sh} " && rm script.sh) \n`);
            });

            socket.on("copy_security", () => {
              copy_conf(`sleep 2 && chmod a+x script.sh && (echo ${password} | sudo -S ./script.sh && rm script.sh ) || ( echo "Using root instead of sudo ..." && source /etc/profile && su - -c "$(pwd)/script.sh " && rm script.sh) \n`);
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
        //conn = null;
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
      if (file === scriptName /* && file.endsWith('.sh') */) {
        console.log(filePath);
        return filePath;
      }
    }
  }
  return null;
}

// Start the HTTP server
server.listen(8080, () => console.log("Server listening on http://localhost:8080"));