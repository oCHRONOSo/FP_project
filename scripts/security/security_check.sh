#!/bin/bash

# Function to check file permissions
check_file_permissions() {
    echo "Checking file permissions..."
    # Check permissions of sensitive files and directories
    sensitive_files=("/etc/passwd" "/etc/shadow" "/etc/ssh/sshd_config")
    for file in "${sensitive_files[@]}"; do
        if [ -e "$file" ]; then
            perms=$(stat -c "%a" "$file")
            if [ "$perms" != "600" ]; then
                echo "Warning: Insecure permissions for file $file. Expected: 600, Actual: $perms"
            fi
        fi
    done
}

# Function to check iptables configurations
check_iptables() {
    echo "Checking iptables configurations..."
    # Check if iptables service is running
    if ! systemctl is-active --quiet iptables; then
        echo "Warning: iptables service is not running."
    else
        # Check if there are any rules configured
        if ! iptables -L &>/dev/null; then
            echo "Warning: No iptables rules configured."
        fi
    fi
}

# Function to check for secure protocols
check_secure_protocols() {
    echo "Checking for secure protocols..."
    # Check if SSH is configured to disallow root login and use SSH keys
    sshd_config="/etc/ssh/sshd_config"
    if grep -qE "^PermitRootLogin\s+no" "$sshd_config"; then
        echo "Root login disabled: Yes"
    else
        echo "Warning: Root login not disabled in SSH configuration."
    fi
    if grep -qE "^PasswordAuthentication\s+no" "$sshd_config"; then
        echo "Password authentication disabled: Yes"
    else
        echo "Warning: Password authentication not disabled in SSH configuration."
    fi
}

# Function to check for installed security updates
check_security_updates() {
    echo "Checking for installed security updates..."
    # Use the package manager to check for security updates
    if ! sudo unattended-upgrade --dry-run -d; then
        echo "Warning: Security updates are available."
    else
        echo "No security updates available."
    fi
}

# Function to check for antivirus software
check_antivirus() {
    echo "Checking for antivirus software..."
    # Check if antivirus software is installed
    if ! dpkg-query -W clamav &>/dev/null; then
        echo "Warning: Antivirus software (ClamAV) not installed."
    else
        echo "Antivirus software (ClamAV) installed."
    fi
}

# Function to scan for open ports
scan_open_ports() {
    echo "Scanning for open ports..."
    # Use netstat or nmap to scan for open ports
    open_ports=$(sudo netstat -tuln | awk '$1 == "tcp" && $NF != "LISTEN" {print $4}' | cut -d ":" -f 2)
    if [ -n "$open_ports" ]; then
        echo "Warning: Open ports detected: $open_ports"
    else
        echo "No open ports detected."
    fi
}

# Function to verify integrity of critical system files
verify_system_files() {
    echo "Verifying integrity of critical system files..."
    # Use a checksum tool to verify system file integrity
    if sudo debsums --changed; then
        echo "Warning: Changes detected in critical system files."
    else
        echo "Critical system files are intact."
    fi
}

# Function to check for unauthorized users or groups
check_unauthorized_users() {
    echo "Checking for unauthorized users or groups..."
    # Check for any unauthorized users or groups
    unauthorized_users=$(awk -F: '($3 < 1000) {print $1}' /etc/passwd)
    if [ -n "$unauthorized_users" ]; then
        echo "Warning: Unauthorized users detected: $unauthorized_users"
    else
        echo "No unauthorized users detected."
    fi
}

# Main function
main() {
    echo "Starting security checks..."
    check_file_permissions
    check_iptables
    check_secure_protocols
    check_security_updates
    check_antivirus
    scan_open_ports
    verify_system_files
    check_unauthorized_users
    echo "Security checks completed."
}

# Run the script
main
