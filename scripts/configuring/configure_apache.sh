

# Define variables
domain="example.com"
directory="/var/www/$domain"
cert_dir="/etc/apache2/ssl/certs"
key_dir="/etc/apache2/ssl/private"
apache_user=$(ps -eo user,group,comm | grep apache | awk '$1 != "root" {print $1}' | sort | uniq)


# Install apache
sudo apt update
sudo apt install apache2

# Create directories
sudo mkdir -p $directory
sudo mkdir -p $cert_dir
sudo mkdir -p $key_dir

# Generate SSL certificate and key
sudo openssl req -new -x509 -days 365 -nodes \
    -out $cert_dir/apache.crt \
    -keyout $key_dir/apache.key \
    -subj "/CN=$domain"

# Enable SSL module
sudo a2enmod ssl

# Create virtual host configuration file
sudo echo "<VirtualHost *:80>
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
    SSLCertificateFile $cert_dir/apache.crt
    SSLCertificateKeyFile $key_dir/apache.key
</VirtualHost>" > /etc/apache2/sites-available/$domain.conf

# Enable the new site configuration
sudo a2ensite $domain.conf

# Disable the default site configuration
sudo a2dissite 000-default.conf

# Set permissions
sudo chmod -R 755 $directory
sudo chown -R $apache_user:$apache_user $directory

# Create index.html 
sudo echo "<html>
    <head>
        <title>Welcome to $domain!</title>
    </head>
    <body>
        <h1>Success! The $domain server block is working!</h1>
    </body>
</html>" > $directory/index.html

# Reload Apache to apply changes
sudo systemctl restart apache2

echo "Configuration for $domain completed successfully."
