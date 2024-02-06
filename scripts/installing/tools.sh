#!/bin/bash
# Update package lists
 apt update

# Install essential tools
 apt install -y \
    git \
    curl \
    wget \
    nano \
    vim \
    htop \
    tmux \
    tree \
    unzip \
    zip \
    dnsutils \
    net-tools \
    traceroute \
    jq \
    ncdu \
    build-essential

# Additional tools (optional)
# Add or remove tools as needed
#  apt install -y <tool1> <tool2> ...

echo "Installation complete."