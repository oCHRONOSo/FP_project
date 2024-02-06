domain="$1"

directory="/var/www/$domain"
cert_dir="/etc/nginx/ssl/certs"
key_dir="/etc/nginx/ssl/private"
nginx_user=$(ps -eo user,group,comm | grep nginx | awk '$1 != "root" {print $1}' | sort | uniq)

 apt update 
 apt install -y nginx php-fpm mariadb-server php-mysql

 mkdir -p $directory
 mkdir -p $cert_dir
 mkdir -p $key_dir

 openssl req -new -x509 -days 365 -nodes \
    -out $cert_dir/nginx.crt \
    -keyout $key_dir/nginx.key \
    -subj "/CN=$domain"




 echo "server {
        #listen 80;
        #listen [::]:80;
        listen 443 ssl http2;
        listen [::]:443 ssl http2;

        ssl_certificate $cert_dir/nginx.crt;
        ssl_certificate_key $key_dir/nginx.key;

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

}" > /etc/nginx/sites-available/$domain 

 echo "server {
    listen 80;
    listen [::]:80;
    server_name $domain;

    return 301 https://\$server_name\$request_uri;
}" > /etc/nginx/sites-available/${domain}_http_redirect

 ln -s /etc/nginx/sites-available/$domain /etc/nginx/sites-enabled/$domain 
 ln -s "/etc/nginx/sites-available/${domain}_http_redirect" "/etc/nginx/sites-enabled/${domain}_http_redirect"

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