// Establish WebSocket connection with the server
// const socket = io("ws://localhost:8080");
const socket = io("ws://192.168.68.195:8080");
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
  socket.emit('startSSHConnection', { ip, username, password, port, sshKeyContent, passphrase }); // starts from here
  showMessage("Connecting to SSH...");
  socket.on("ssh.status", (status) => {
    showMessage(status);
    isConnected = status === "SSH connection successful!";
    if (!isTerminalInitialized && isConnected) {
      initializeTerminal();
      openTerminal();
      console.log('terminal initialized');
      }
  });
  // if(isConnected == false) {

  // }
}

// Disconnect from SSH server
function disconnectSSH() {
  if (!isConnected) {
    showMessage("Not connected!");
    return;
  }
  // closeTerminal();
  // term = null;
  // document.getElementById('terminal-container').innerHTML = null;
  // isTerminalInitialized = false;
  showMessage("Disconnecting from SSH...");
  // isConnected = false;
  socket.emit('closeshell');
  socket.emit('disconnectSSH');
  
}

// Open the terminal
function openTerminal() {
  if (!isConnected) {
    showMessage("Cannot open terminal. Ensure SSH connection is established.");
    console.log("1")
    return;
  }
  if (isTerminalOpen) {
    showMessage("Terminal is already open.");
    return;
  }
  var element = document.getElementById('terminal-container');
  element.hidden = false;
  isTerminalOpen = true;

  var wrapper = document.getElementById('wrapper');
  wrapper.hidden = false;
  console.log("0")

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
  var wrapper = document.getElementById('wrapper');
  wrapper.hidden = true;
  isTerminalOpen = false;

}


// Update state of terminal buttons
function updateTerminalButtons() {
  const openTerminalBtn = document.getElementById('open-terminal-btn');
  const closeTerminalBtn = document.getElementById('close-terminal-btn');
  console.log(closeTerminalBtn);

  openTerminalBtn.disabled = isConnected && isTerminalOpen;
  closeTerminalBtn.disabled = ! openTerminalBtn.disabled;
}

// Send test command to the server
function testCommand() {
  socket.emit('command');
}

// Copy script to the server and configure web server
function copy(button) {
  const input_name = button;
  socket.emit("path", input_name);
  socket.emit('copy');
}

function copy_install(button) {
  const input_name = button;
  socket.emit("path", input_name);
  socket.emit('copy_install');
}

function copyWebserver(button) {
  const input_name = button;
  const domain = document.getElementById("domain").value;
  const folderName = document.getElementById("folder_name").value;
  const isSecure = document.getElementById("matchCaseSec").checked;
  socket.emit("path", input_name);
  socket.emit('configue_webserver', {domain, folderName, isSecure});
  socket.emit('copy_webserver');

}

function copyWordpress(button) {
  const input_name = button;
  const folderName = document.getElementById("wp_folder_name").value;
  socket.emit("path", input_name);
  socket.emit('configue_wp', folderName);
  socket.emit('copy_wp');

}

function copyDb(button) {
  const input_name = button;
  const dbname = document.getElementById("db_name").value;
  const dbuser = document.getElementById("db_user").value;
  const dbhost = document.getElementById("db_host").value;
  const dbpassword = document.getElementById("db_password").value;
  socket.emit("path", input_name);
  socket.emit('configue_db', {dbname, dbuser, dbhost, dbpassword});
  socket.emit('copy_db');

}

function copyDNS(button) {
  const input_name = button;
  const dns_domain = document.getElementById("dns_domain").value;
  const dns_ip = document.getElementById("dns_ip").value;
  socket.emit("path", input_name);
  socket.emit('configue_dns', {dns_domain, dns_ip});
  socket.emit('copy_dns');

  console.log(`${dns_domain} ${dns_ip}`)
}

function copyRecord(button) {
  const input_name = button;
  var selectElement = document.getElementById("recordType");
  var selectedOption = selectElement.options[selectElement.selectedIndex];
  var recordType = selectedOption.innerHTML;
  const dns_conf_file = document.getElementById("dns_conf_file").value;
  var value1 = document.getElementById("dns_value_1").value;
  var value2 = document.getElementById("dns_value_2").value;
  socket.emit("path", input_name);
  socket.emit('configue_dns_record', {dns_conf_file, recordType, value1, value2});
  socket.emit('copy_dns_record');
}

function copydhcp(button) {
  const input_name = button;
  const interfaceName = document.getElementById("interface").value;
  const subnetIP = document.getElementById("dhcp_subnet_ip").value;
  const subnetMask = document.getElementById("dhcp_subnet_mask").value;
  const dhcpRangeStart = document.getElementById("dhcp_range_start").value;
  const dhcpRangeEnd = document.getElementById("dhcp_range_end").value;
  const gatewayIP = document.getElementById("gateway_ip").value;
  const dnsIP = document.getElementById("dhcp_dns_ip").value;

  // Replace the following lines with your socket.emit calls
  socket.emit("path", input_name);
  socket.emit('configue_dhcp', {
      interfaceName,
      subnetIP,
      subnetMask,
      dhcpRangeStart,
      dhcpRangeEnd,
      gatewayIP,
      dnsIP
  });
  socket.emit('copy_dhcp');
}

function copysecurity(button) {
  const input_name = button;
  socket.emit("path", input_name);
  socket.emit('copy_security');
}

// Handle SSH error messages
socket.on("ssh.error", (errorMessage) => {
  showMessage(`Error: ${errorMessage}`);
  isConnected = false;
});

// Handle server disconnection
socket.on("disconnect", () => {
  showMessage("Server Disconnected");
  isConnected = false;
  isTerminalOpen = false;
});



// recent connections

socket.on('recentConnections', (results) => {
  console.log('Recent connections:', results);
  
  // Get a reference to the table body element
  const tableBody = document.getElementById('connectionsTableBody');

  // Clear existing rows from the table body
  tableBody.innerHTML = '';

  // Loop through the connections array and create table rows
  results.forEach(connection => {
    const row = document.createElement('tr');

    // Create table cells for each connection property
    const ipCell = document.createElement('td');
    ipCell.textContent = connection.ip;
    row.appendChild(ipCell);

    const portCell = document.createElement('td');
    portCell.textContent = connection.port;
    row.appendChild(portCell);

    const usernameCell = document.createElement('td');
    usernameCell.textContent = connection.username;
    row.appendChild(usernameCell);

/*     const passwordCell = document.createElement('td');
    passwordCell.textContent = connection.password;
    row.appendChild(passwordCell); */

    // Create a button cell with a button for each row
    const actionsCell = document.createElement('td');
    const button = document.createElement('button');
    button.textContent = 'Use';
    button.setAttribute("class","btn btn-secondary rounded-pill")
    button.addEventListener('click', () => {
      // Define the action to be performed when the button is clicked

      document.getElementById("ip").value = connection.ip;
      document.getElementById("dns_ip").value = connection.ip;
      document.getElementById("port").value = connection.port;
      document.getElementById("username").value = connection.username;
      document.getElementById("password").value = connection.password;
    });
    actionsCell.appendChild(button);
    row.appendChild(actionsCell);

    // Append the row to the table body
    tableBody.appendChild(row);
  });
});

// Toggle between dark and light themes
document.getElementById('flexSwitchCheckDefault').addEventListener('click', () => {
  document.documentElement.setAttribute('data-bs-theme', document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark');
});


// add tabs for configuration
var section = document.getElementsByClassName("tab-section");
for (s = 0; s < section.length; s++){
  var tabcontent = section[s].getElementsByClassName("tabcontent");
  var tablinks = section[s].getElementsByClassName("tablink");
  for (i = 1; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks[0].classList.add("bg-body-secondary");
}

var section_btn = document.getElementsByClassName("btn-section");
for (s = 0; s < section_btn.length; s++){
  var tabcontent = section_btn[s].getElementsByClassName("btncontent");
  var tablinks = section_btn[s].getElementsByClassName("btnlink");
  for (i = 1; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks[0].classList.replace("btn-outline-primary","btn-primary");
}

// document.getElementById("tab1").style.display = "block";
// document.getElementById("tablink1").classList.add("bg-body-secondary");

// document.getElementById("dns_tab1").style.display = "block";
// document.getElementById("dns_tablink1").classList.add("bg-body-secondary");

  // Function to open a specific tab
  function openTab(tabName, tabLink, sectionId) {
    var i;
    var section = document.getElementById(sectionId);
    var tabcontent = section.getElementsByClassName("tabcontent");
    var tablinks = section.getElementsByClassName("tablink");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("bg-body-secondary");
    }
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabLink).classList.add("bg-body-secondary");   
}

  // Function to open a specific button
  function openBtn(tabName, tabLink, sectionId) {
    var i;
    var section = document.getElementById(sectionId);
    var tabcontent = section.getElementsByClassName("btncontent");
    var tablinks = section.getElementsByClassName("btnlink");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.replace("btn-primary","btn-outline-primary");
    }
    document.getElementById(tabName).style.display = "flex";
    document.getElementById(tabLink).classList.replace("btn-outline-primary","btn-primary");   
}


// search for packages



  var searchInput = document.getElementById("searchInput");
  var buttons = document.getElementsByClassName("install");

  searchInput.addEventListener("input", e => {
      const searchText = e.target.value.toLowerCase();     
      for (var i = 0; i < buttons.length; i++) {
          var button = buttons[i];
          var buttonText = button.textContent.toLowerCase();
          
          if (buttonText.includes(searchText)) {
              button.style.display = "inline-block";
          } else {
              button.style.display = "none";
          }
      }
  });

function updateip(){
    document.getElementById("dns_ip").value = document.getElementById("ip").value
    document.getElementById("dhcp_ip").value = document.getElementById("ip").value
}
updateip();

function generateRule() {
  var table = document.getElementById("table").value;
  var chain = document.getElementById("chain").value;
  var type = document.getElementById("type").value;
  var protocol = document.getElementById("protocol").value;
  var originIP = document.getElementById("originIP").value;
  var destinationIP = document.getElementById("destinationIP").value;
  var outputInterface = document.getElementById("outputInterface").value;
  var inputInterface = document.getElementById("inputInterface").value;
  var sourcePort = document.getElementById("sourcePort").value;
  var destinationPort = document.getElementById("destinationPort").value;
  var user = document.getElementById("user").value;
  var finalAction = document.getElementById("finalAction").value;
  var logTag = document.getElementById("logTag").value;

  var command = "iptables -t " + table + " -" + type + " " + chain;
  if (protocol !== "") command += " -p " + protocol;
  if (originIP !== "") command += " -s " + originIP;
  if (destinationIP !== "") command += " -d " + destinationIP;
  if (outputInterface !== "") command += " -o " + outputInterface;
  if (inputInterface !== "") command += " -i " + inputInterface;
  if (sourcePort !== "") command += " --sport " + sourcePort;
  if (destinationPort !== "") command += " --dport " + destinationPort;
  if (user !== "") command += " -m owner --uid-owner " + user;
  command += " -j " + finalAction;
  if (finalAction === "LOG" && logTag !== "") command += " --log-prefix " + logTag;
  iptable_cont = document.getElementById("result");
  iptable_cont.hidden = false;
  iptable_cont.innerHTML = '<div class="row"><div class="col-sm-12 col-md-10">'+ command +'</div>' + '<div class="col-sm-12 col-md-2 text-end"><button class="btn btn-outline-secondary" id="copyRule"><i class="bi bi-copy"></i></button></div></div>';
  iptable_cont.setAttribute("class","col bg-body p-4 rounded-4 border border-secondary-subtle");
  copybtn = document.getElementById("copyRule");

  copybtn.addEventListener('click', function(event) {
    
    text = iptable_cont.innerText;
    copyTextToClipboard(text);
  });
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}



// themes dropodown

const themes = {
  "dark-green": "Dark Green",
  "dark-yellow": "Dark Yellow",
  "dark-gold": "Dark Gold",
  "dark-violet": "Dark Violet",
  "dark-warm-brown": "Dark Warm Brown",
  "dark-blue-grey": "Dark Blue Grey",
  "dark-cream-green": "Dark Cream Green",
  "sky-blue": "Sky Blue",
  "cream": "Cream",
  "cloudy-green": "Cloudy Green",
  "cream-grey": "Cream Grey",
  "light-violet": "Light Violet",
  "cream-green-light": "Cream Green Light"
};

const themeSelect = document.getElementById('themeSelect');

Object.entries(themes).forEach(([key, value]) => {
const option = document.createElement('option');
option.value = key;
option.textContent = value;
themeSelect.appendChild(option);
});

themeSelect.addEventListener('change', function(event) {
const newTheme = event.target.value;
if (newTheme) {
  document.documentElement.setAttribute('data-bs-theme', newTheme);
}
});


  // Function to set a cookie
  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  // Function to get a cookie
  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) == 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  }

  // Function to handle select change
  document.getElementById("themeSelect").addEventListener("change", function() {
    var selectedOption = this.value;
    setCookie("selectedOption", selectedOption, 365); // Set cookie for 1 year
  });

  // Check if there is a stored option and select it
  var storedOption = getCookie("selectedOption");
  if (storedOption) {
    document.getElementById("themeSelect").value = storedOption;
    document.documentElement.setAttribute('data-bs-theme', storedOption);
  }



 // terminal full screen

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

