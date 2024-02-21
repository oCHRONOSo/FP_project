#!/bin/bash

 apt update 
 apt install -y nginx php-fpm mariadb-server
 apt install -y php php-gd php-xmlrpc php-common php-curl php-intl php-imagick php-mysql php-zip php-xml php-mbstring php-bcmath

# Check if Nginx is running
if systemctl is-active --quiet nginx; then
    echo "nginx is installed and running."
else
    echo "nginx installation failed or nginx is not running."
fi
