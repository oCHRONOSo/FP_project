domain="$1"
foldername="$2"
secure="$3"

directory="/var/www/$foldername"
# Install MariaDB server
apt install -y mariadb-server

# Remove contents of the directory
rm -rf "$directory"/*

# Download WordPress
wget -O "$directory/latest.zip" https://wordpress.org/latest.zip --wait=5

unzip $directory/latest.zip -d $directory/
cp -r "$directory/wordpress"/* "$directory/"
rm -r "$directory/wordpress"

# Create database and user in MariaDB
mariadb <<MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS wordpress_$foldername;
CREATE USER IF NOT EXISTS 'wpuser'@'localhost' IDENTIFIED BY 'patata1234';
GRANT ALL ON wordpress_$foldername.* TO 'wpuser'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

# Change ownership of directory to www-data
chown -R www-data:www-data "$directory"
