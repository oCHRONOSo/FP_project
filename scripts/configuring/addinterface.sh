#!/bin/bash

# Function to add interface configuration
add_interface_config() {
    local interface_name=$1
    local ip_address=$2
    local subnet_mask=$3
    local gateway=$4

    # Construct the configuration string
    config="allow-hotplug $interface_name
    iface $interface_name inet static
    address $ip_address
    netmask $subnet_mask"

    # Add gateway if provided
    if [ ! -z "$gateway" ]; then
        config="$config
    gateway $gateway"
    fi

    # Append configuration to /etc/network/interfaces
    echo "$config" >> /etc/network/interfaces
}



# Call the function with provided values
while true; do
# Prompt user for interface information
read -p "Enter interface name: " interface_name
read -p "Enter IP address: " ip_address
read -p "Enter subnet mask: " subnet_mask
read -p "Enter gateway (optional, press Enter if none): " gateway

add_interface_config "$interface_name" "$ip_address" "$subnet_mask" "$gateway"
echo "Interface configuration added successfully."
read -p "add more interface ? (y/n)" YN
if [ "$YN" == "n" ]; then
    break
fi

done 
