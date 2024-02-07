#!/bin/bash

domain="$1"
foldername="$2"

directory="/var/www/$foldername"
cert_dir="/etc/nginx/ssl/certs"
key_dir="/etc/nginx/ssl/private"
nginx_user=$(ps -eo user,group,comm | grep nginx | awk '$1 != "root" {print $1}' | sort | uniq)

 apt update 
 apt install -y nginx php-fpm mariadb-server php-mysql

 mkdir -p $directory
 mkdir -p $cert_dir
 mkdir -p $key_dir

 openssl req -new -x509 -days 365 -nodes \
    -out $cert_dir/nginx_${foldername}.crt \
    -keyout $key_dir/nginx_${foldername}.key \
    -subj "/CN=$domain"




 echo "server {
        #listen 80;
        #listen [::]:80;
        listen 443 ssl http2;
        listen [::]:443 ssl http2;

        ssl_certificate $cert_dir/nginx_${foldername}.crt;
        ssl_certificate_key $key_dir/nginx_${foldername}.key;

        root $directory;

        index index.php index.html index.htm index.nginx-debian.html;

        server_name $domain;
        location / {
                try_files \$uri \$uri/ =404;
        }

        location ~ \.php$ {
                include snippets/fastcgi-php.conf;
                fastcgi_pass unix:/run/php/php-fpm.sock;
        }

}" > /etc/nginx/sites-available/$foldername 

 echo "server {
    listen 80;
    listen [::]:80;
    server_name $domain;

    return 301 https://\$server_name\$request_uri;
}" > /etc/nginx/sites-available/${foldername}_http_redirect

 ln -s /etc/nginx/sites-available/$foldername /etc/nginx/sites-enabled/$foldername 
 ln -s "/etc/nginx/sites-available/${foldername}_http_redirect" "/etc/nginx/sites-enabled/${foldername}_http_redirect"

 echo "<html>
    <head>
        <title>Welcome to $domain! </title>
    </head>
    <body>
        <h1>Success! The $domain server block is working! (Nginx)</h1>
    </body>
</html>" > $directory/index.html

 chmod -R 755 $directory
 chown -R $nginx_user:$nginx_user $directory

 systemctl restart nginx

echo "Configuration for $domain completed successfully."