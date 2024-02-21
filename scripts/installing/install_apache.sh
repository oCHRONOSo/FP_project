#!/bin/bash

 apt update
 apt install -y apache2 mariadb-server
 apt install -y php php-common php-gd php-xmlrpc php-curl php-intl php-imagick php-mysql php-zip php-xml php-mbstring php-bcmath libapache2-mod-php

# Check if Apache is running
if systemctl is-active --quiet apache2; then
    echo "Apache is installed and running."
else
    echo "Apache installation failed or Apache is not running."
fi
