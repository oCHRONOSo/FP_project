# Function to install common tools
install_tools() {
    # Update package lists
    sudo apt update

    # Install essential tools
    sudo apt install -y \
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
    # sudo apt install -y <tool1> <tool2> ...
}

# Main function
main() {
    echo "Installing common tools..."
    install_tools
    echo "Installation complete."
}

# Run the main function
main