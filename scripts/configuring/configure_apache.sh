#!/bin/bash

# Define variables
domain="$1"
foldername="$2"
secure="$3"

directory="/var/www/$foldername"
cert_dir="/etc/apache2/ssl/certs"
key_dir="/etc/apache2/ssl/private"
apache_user=$(ps -eo user,group,comm | grep apache | awk '$1 != "root" {print $1}' | sort | uniq)


# Install apache
 apt update
 apt install -y apache2 mariadb-server
 apt install -y php php-common php-gd php-xmlrpc php-curl php-intl php-imagick php-mysql php-zip php-xml php-mbstring php-bcmath libapache2-mod-php
# Create directories
 mkdir -p $directory
 mkdir -p $cert_dir
 mkdir -p $key_dir

# Generate SSL certificate and key
 openssl req -new -x509 -days 365 -nodes \
    -out $cert_dir/apache_${foldername}.crt \
    -keyout $key_dir/apache_${foldername}.key \
    -subj "/CN=$domain"

# Enable SSL module
 a2enmod ssl

if [ "$secure" == "true" ]; then
    # Create virtual host configuration file (secure)
     echo "<VirtualHost *:80>
    ServerAdmin webmaster@$domain
    ServerName $domain
    DocumentRoot $directory
    ErrorLog \${APACHE_LOG_DIR}/$domain-error.log
    CustomLog \${APACHE_LOG_DIR}/$domain-access.log combined
    Redirect permanent / https://$domain/
</VirtualHost>

<VirtualHost *:443>
    ServerAdmin webmaster@$domain
    ServerName $domain
    DocumentRoot $directory
    ErrorLog \${APACHE_LOG_DIR}/$domain-error.log
    CustomLog \${APACHE_LOG_DIR}/$domain-access.log combined
    SSLEngine on
    SSLCertificateFile $cert_dir/apache_${foldername}.crt
    SSLCertificateKeyFile $key_dir/apache_${foldername}.key
    <Directory $directory>
            AllowOverride All
    </Directory>
</VirtualHost>" > /etc/apache2/sites-available/$foldername.conf
else
# Create virtual host configuration file 
 echo "<VirtualHost *:80>

    ServerAdmin webmaster@$domain
    ServerName $domain
    DocumentRoot $directory
    ErrorLog \${APACHE_LOG_DIR}/$domain-error.log
    CustomLog \${APACHE_LOG_DIR}/$domain-access.log combined
    <Directory $directory>
            AllowOverride All
    </Directory>
</VirtualHost>" > /etc/apache2/sites-available/$foldername.conf
fi







# Enable the new site configuration
 a2ensite $foldername.conf

# Disable the default site configuration
# a2dissite 000-default.conf

# Set permissions
 chmod -R 755 $directory
 chown -R $apache_user:$apache_user $directory

# Create index.html 
 echo "<html>
    <head>
        <title>Welcome to $domain! </title>
    </head>
    <body>
        <h1>Success! The $domain server block is working! (Apache) </h1>
    </body>
</html>" > $directory/index.html

# Reload Apache to apply changes
 systemctl restart apache2

echo "Configuration for $domain completed successfully."
