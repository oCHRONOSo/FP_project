#!/bin/bash

# Check if arguments are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <DNS_IP> <DOMAIN_NAME>"
    exit 1
fi

# Extract arguments
DNS_IP="$1"
DOMAIN="$2"

# Function to configure BIND DNS server
configure_bind() {
    # Configure named.conf.local
    cat <<EOF > /etc/bind/named.conf.local
zone "$DOMAIN" {
    type master;
    file "/etc/bind/db.$DOMAIN";
};

zone "$(echo $DNS_IP | awk -F'.' '{print $4"."$3"."$2"."$1}').in-addr.arpa" {
    type master;
    file "/etc/bind/db.$(echo $DNS_IP | awk -F'.' '{print $4"."$3"."$2"."$1}').reverse";
};
EOF
    
    # Create forward zone file
    cat <<EOF > /etc/bind/db.$DOMAIN
\$TTL    86400
@       IN      SOA     ns1.$DOMAIN. admin.$DOMAIN. (
                          3         ; Serial
                     604800         ; Refresh
                      86400         ; Retry
                    2419200         ; Expire
                     86400 )       ; Negative Cache TTL
;
@       IN      NS      ns1.$DOMAIN.
@       IN      NS      ns2.$DOMAIN.
ns1     IN      A       $DNS_IP
ns2     IN      A       $DNS_IP
EOF
    
    # Create reverse zone file
    reverse_ip=$(echo $DNS_IP | awk -F'.' '{print $4"."$3"."$2"."$1}')
    cat <<EOF > /etc/bind/db.$DOMAIN.reverse
\$TTL    86400
@       IN      SOA     ns1.$DOMAIN. admin.$DOMAIN. (
                          3         ; Serial
                     604800         ; Refresh
                      86400         ; Retry
                    2419200         ; Expire
                     86400 )       ; Negative Cache TTL
;
@       IN      NS      ns1.$DOMAIN.
@       IN      NS      ns2.$DOMAIN.
$(echo $reverse_ip | awk -F'.' '{print $1"."$2"."$3"."$4}')     IN      PTR     $DOMAIN.
EOF
    
    # Set permissions
    chown -R bind:bind /etc/bind
    
    # Restart BIND service
    systemctl restart named
    
    echo "BIND DNS server configured successfully."
}

# Main execution
if [ "$EUID" -ne 0 ]; then
    echo "Please run this script as root or using sudo."
    exit 1
fi

configure_bind
