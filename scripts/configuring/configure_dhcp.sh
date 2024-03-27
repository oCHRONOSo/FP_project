#!/bin/bash

# Check if arguments are provided
if [ $# -ne 7 ]; then
    echo "Usage: $0 <INTERFACE> <SUBNET_IP> <SUBNET_MASK> <DHCP_RANGE_START> <DHCP_RANGE_END> <GATEWAY_IP> <DNS_IP>"
    exit 1
fi

# Extract arguments
INTERFACE="$1"
SUBNET_IP="$2"
SUBNET_MASK="$3"
DHCP_RANGE_START="$4"
DHCP_RANGE_END="$5"
GATEWAY_IP="$6"
DNS_IP="$7"

# Configuration file
CONFIG_FILE="/etc/kea/kea-dhcp4.conf"

# Backup the original configuration file
if [ ! -f "$CONFIG_FILE.bak" ]; then
    cp "$CONFIG_FILE" "${CONFIG_FILE}.bak"
fi

# Generate Kea DHCP server configuration
cat <<EOF > "$CONFIG_FILE"
{
    "Dhcp4": {
        "interfaces-config": {
            "interfaces": [ "$INTERFACE" ]
        },
        "lease-database": {
            "type": "memfile",
            "lfc-interval": 3600
        },
        "expired-leases-processing": {
            "reclaim-timer-wait-time": 10,
            "flush-reclaimed-timer-wait-time": 25,
            "hold-reclaimed-time": 3600,
            "max-reclaim-leases": 100,
            "max-reclaim-time": 250,
            "unwarned-reclaim-cycles": 2
        },
        "subnet4": [
            {
                "subnet": "$SUBNET_IP/$SUBNET_MASK",
                "pools": [
                    {
                        "pool": "$DHCP_RANGE_START - $DHCP_RANGE_END"
                    }
                ],
                "option-data": [
                    {
                        "name": "routers",
                        "data": "$GATEWAY_IP"
                    },
                    {
                        "name": "domain-name-servers",
                        "data": "$DNS_IP"
                    }
                ]
            }
        ]
    }
}
EOF

echo "Kea DHCP server configuration file created: $CONFIG_FILE"
