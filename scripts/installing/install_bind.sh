#!/bin/bash

# Update package index
apt update

# Install BIND9
apt install -y bind9

# Verify installation
bind_version=$(named -v | awk '{print $2}')
echo "BIND9 DNS Server version $bind_version installed."