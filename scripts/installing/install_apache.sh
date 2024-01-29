

# Update package index
sudo apt update

# Install Apache
sudo apt install apache2 -y

# Check if Apache is running
if systemctl is-active --quiet apache2; then
    echo "Apache is installed and running."
else
    echo "Apache installation failed or Apache is not running."
fi
