apt install -y mariadb-server

# create user / database

mariadb

CREATE DATABASE wordpress;
USE wordpress;
GRANT ALL ON wordpress.* TO 'wpuser'@'localhost' IDENTIFIED BY 'patata1234';
FLUSH PRIVILEGES;
quit
chown -R www-data:www-data /var/www/wordpress
