# Remote Server Configuration WebApp

Welcome to the Remote Server Configuration WebApp! This project allows you to remotely connect to servers via SSH and perform various configuration tasks through a user-friendly web interface. Below you'll find documentation on how to use the application and an overview of its key features.

## Installation

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Install dependencies by running ```npm install```.

## Usage

To launch the server, run:
```
node index.js
```


Ensure that any file format errors are fixed when moving from Windows to Unix systems by converting CRLF line endings to LF.

## Functionality

### 1. SSH Connection

The application allows you to establish SSH connections to remote servers. Once connected, you can execute commands and perform configurations.

### 2. Terminal Enhancements

Enhanced terminal features include search functionality, fit addon, and full-screen terminal using xterm.js for improved user experience.

### 3. HTTPS and WordPress Support

You can configure HTTPS and install WordPress via checkboxes provided in the interface.

### 4. AI Integration

Integrates Ollama for AI assistance in server configuration. Run Ollama with the following command (use localhost or your ip):
```
OLLAMA_HOST=0.0.0.0 OLLAMA_ORIGINS=http://127.0.0.1:* ollama serve
```

### 5. Custom Styling

Allows customization of styles using SASS. Watch for changes in custom.scss and compile to custom.css with:
```
sass --watch custom.scss:custom.css
```

### 6. Recent Connections

Utilizes MySQL to store recent connections. Export/import database for retaining connection history.
- Export database:
```
mysqldump -u user -p db_conn > db_conn.sql
```
- Import database:
```
mysql -u user -p db_conn < /home/user/db_conn.sql
```
### 7. Security Checks

Fixes sudo errors and ensures proper privilege escalation handling for enhanced security.

### 8. Package Search and Configuration Tabs

Provides search functionality for packages and organizes configurations into tabs for better organization.

### 9. DNS and DHCP Configuration

Implements DNS and DHCP scripts for network management.

### 10. Nginx and Apache Support

Enables configuration and management of Nginx and Apache web servers.

### 11. Iptables Command Generator

Generates iptables rules for firewall configuration to enhance server security.



Feel free to explore and contribute to this project! If you encounter any issues or have suggestions for improvements, please don't hesitate to open an issue or submit a pull request. Happy configuring!
