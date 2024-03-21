#!/bin/bash
db_name="$1" 
db_user="$2"
db_user_password="$3"
db_host="$4"

mariadb <<MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS ${db_name};
CREATE USER IF NOT EXISTS '${db_user}'@'${db_host}' IDENTIFIED BY '${db_user_password}';
GRANT ALL ON ${db_name}.* TO '${db_user}'@'${db_host}';
FLUSH PRIVILEGES;
MYSQL_SCRIPT