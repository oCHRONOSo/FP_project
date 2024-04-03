#!/bin/bash

foldername="$1"

directory="/var/www/$foldername"
# Install MariaDB server
# apt install -y mariadb-server

# Remove contents of the directory
if [ "$directory" != "" ] ; then
     rm -rf "$directory"/*
fi

# Download WordPress

if [ ! -f "$directory/latest.zip" ]; then
     wget -O "$directory/latest.zip" https://wordpress.org/latest.zip --wait=5
     unzip $directory/latest.zip -d $directory/
     cp -r "$directory/wordpress"/* "$directory/"
     rm -r "$directory/wordpress"
     chown -R www-data:www-data "$directory"
fi


echo "Done !"
