#!/bin/bash

# Update package index
apt update

# Install Kea
apt install -y kea

# Verify installation
kea_version=$(kea-dhcp4-server -V | awk '{print $3}')
echo "Kea DHCP Server version $kea_version installed."