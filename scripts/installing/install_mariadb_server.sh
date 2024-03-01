#!/bin/bash

apt update 
apt install -y mariadb-server

if systemctl is-active --quiet mariadb; then
    echo "mariadb is installed and running."
else
    echo "mariadb installation failed or mariadb is not running."
fi