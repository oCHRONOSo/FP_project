#!/bin/bash

# Function to log messages
log_message() {
    echo "$(date +"%Y-%m-%d %H:%M:%S") - $1" >> security_log.txt
}

# Function to check if the script is run by an authorized user
# check_user() {
#     authorized_user="admin"
#     if [ "$(whoami)" != "$authorized_user" ]; then
#         echo "Error: You are not authorized to run this script."
#         exit 1
#     fi
# }

update_progress() {
    current_step=$1
    total_steps=$2
    percentage=$((current_step * 100 / total_steps))
    echo -ne "Progress: $percentage% ["
    for ((i=0; i<percentage/2; i++)); do
        echo -ne "="
    done
    for ((i=percentage/2; i<50; i++)); do
        echo -ne " "
    done
    echo -ne "]\r"

}

# Function to interpret file permissions
interpret_permission() {
    perm=$1
    owner=$((perm / 100))
    group=$(((perm / 10) % 10))
    others=$((perm % 10))

    # Function to convert numeric permission to symbolic representation
    translate() {
        case $1 in
            0) echo "-" ;;
            1) echo "x (execute)" ;;
            2) echo "w (write)" ;;
            3) echo "wx (write and execute)" ;;
            4) echo "r (read)" ;;
            5) echo "r-x (read and execute)" ;;
            6) echo "rw- (read and write)" ;;
            7) echo "rwx (read, write, and execute)" ;;
        esac
    }

    # Function to determine security level
    security_level() {
        case $1 in
            0) echo "Secure" ;;
            1|2|3|4|5) echo "Warning" ;;
            6|7) echo "Danger";;
        esac
    }

    echo -n "Owner: "
    translate $owner
    echo " [$(security_level $owner)]"
    echo -n "Group: "
    translate $group
    echo " [$(security_level $group)]"
    echo -n "Others: "
    translate $others
    echo " [$(security_level $others)]"
}



# Function to check file permissions
check_file_permissions() {
    log_message "Checking file permissions..."
    # Check permissions of sensitive files and directories
    sensitive_files=(
        "/etc/passwd"
        "/etc/shadow"
        "/etc/ssh/sshd_config"
        "/etc/sudoers"
        "/etc/cron.d"
    )
    for file in "${sensitive_files[@]}"; do
        if [ -e "$file" ]; then
            perms=$(stat -c "%a" "$file")
            message=$(
            echo -e " \n$file \n"
            interpret_permission "$perms")
            log_message "$message"
        else
            log_message "File $file not found."
        fi
    done
}

# Function to check iptables configurations
check_iptables() {
    log_message "Checking iptables configurations..."
    # Check if iptables service is running
    if ! systemctl is-active --quiet iptables; then
        log_message "Warning: iptables service is not running."
    else
        # Check if there are any rules configured
        if ! iptables -L &>/dev/null; then
            log_message "Warning: No iptables rules configured."
        fi
    fi
}

# Function to check for secure protocols
check_secure_protocols() {
    log_message "Checking for secure protocols..."
    # Check if SSH is configured to disallow root login and use SSH keys
    sshd_config="/etc/ssh/sshd_config"
    if grep -qE "^PermitRootLogin\s+no" "$sshd_config"; then
        log_message "Root login disabled: Yes"
    else
        log_message "Warning: Root login not disabled in SSH configuration."
    fi
    if grep -qE "^PasswordAuthentication\s+no" "$sshd_config"; then
        log_message "Password authentication disabled: Yes"
    else
        log_message "Warning: Password authentication not disabled in SSH configuration."
    fi
}

# Function to check for installed security updates
check_security_updates() {
    log_message "Checking for installed security updates..."
    # Use the package manager to check for security updates
    if ! sudo unattended-upgrade --dry-run -d; then
        log_message "Warning: Security updates are available."
    else
        log_message "No security updates available."
    fi
}

# Function to check for antivirus software
check_antivirus() {
    log_message "Checking for antivirus software..."
    # Check if antivirus software is installed
    if ! dpkg-query -W clamav &>/dev/null; then
        log_message "Warning: Antivirus software (ClamAV) not installed."
    else
        log_message "Antivirus software (ClamAV) installed."
    fi
}

# Function to scan for open ports
scan_open_ports() {
    log_message "Scanning for open ports..."
    # Use nmap to scan for open ports
    open_ports=$(sudo nmap -sTU localhost | grep 'open' | awk '{print $1}' | cut -d "/" -f 1)
    if [ -n "$open_ports" ]; then
        log_message "Warning: Open ports detected: $open_ports"
    else
        log_message "No open ports detected."
    fi
}

# Function to verify integrity of critical system files
verify_system_files() {
    log_message "Verifying integrity of critical system files..."
    # Use a checksum tool to verify system file integrity
    if sudo debsums --changed; then
        log_message "Warning: Changes detected in critical system files."
    else
        log_message "Critical system files are intact."
    fi
}

# Function to check for unauthorized users or groups
check_unauthorized_users() {
    log_message "Checking for unauthorized users or groups..."
    # Check for any unauthorized users or groups
    unauthorized_users=$(awk -F: '($3 < 1000) {print $1}' /etc/passwd)
    if [ -n "$unauthorized_users" ]; then
        log_message "Warning: Unauthorized users detected: $unauthorized_users"
    else
        log_message "No unauthorized users detected."
    fi
}

# Main function
main() {
    log_message "Starting security checks..."
        echo ""
        update_progress 1 9
    check_file_permissions
        update_progress 2 9
    check_iptables
        update_progress 3 9
    check_secure_protocols
        update_progress 4 9
    check_security_updates
        update_progress 5 9
    check_antivirus
        update_progress 6 9
    scan_open_ports
        update_progress 7 9
    verify_system_files
        update_progress 8 9
    check_unauthorized_users
        update_progress 9 9
        echo ""
    log_message "Security checks completed."
}

# Run the main function
main 2> errors.log
