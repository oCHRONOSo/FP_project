#!/bin/bash

# Function to validate an IP address
validate_ip() {
    local ip=$1
    local regex="^([0-9]{1,3}\.){3}[0-9]{1,3}$"
    
    if [[ $ip =~ $regex ]]; then
        # Split the IP address into octets
        IFS='.' read -r -a octets <<< "$ip"
        
        # Check each octet
        for octet in "${octets[@]}"; do
            if ! [[ $octet -ge 0 && $octet -le 255 ]]; then
                echo "Invalid IP address: $ip"
                return 1
            fi
        done
        
        echo "Valid IP address: $ip"
        return 0
    else
        echo "Invalid IP address format: $ip"
        return 1
    fi
}

#function to check the interface

check_interface() {
    local interface=$1
    if [[ -z $(ip link show "$interface" 2>/dev/null) ]]; then
        echo "Interface $interface does not exist."
        return 1
    elif [[ $(ip link show "$interface" | grep -c "state UP") -eq 0 ]]; then
        echo "Interface $interface is not activated."
        return 1
    else
        echo "Interface $interface exists and is activated."
        return 0
    fi
}




while true; do
    read -p "Type the origin IP address, 's' to skip, '0' to go back : " origin_ip
    if [[ $origin_ip == "0" ]]; then
        echo "Retuning back"
        break
    fi

    if [[ $origin_ip == "s" ]]; then
        echo "Skipping origin IP input."
    fi
    

    if [[ $origin_ip == "s" ]] || validate_ip "$origin_ip"; then
        while true; do

            read -p "Type the destination IP address, 's' to skip, '0' to go back: " destination_ip
            if [[ $destination_ip == "0" ]]; then
                echo "Retuning back"
                break
            fi            
            if [[ $destination_ip == "s" ]]; then
                echo "Skipping destination IP input."
            fi

            if  [[ $destination_ip == "s" ]] || validate_ip "$destination_ip"; then
                while true; do
                    read -p "Type the name of your output interface, 's' to skip, '0' to go back: " interface_output                   
                    if [[ $interface_output == "0" ]]; then
                        echo "Retuning back"
                        break
                    fi  
                    if [[ $interface_output == "s" ]]; then
                        echo "Skipping output interface input."
                    fi   

                    if  [[ $interface_output == "s" ]] || check_interface "$interface_output"; then
                        while true; do
                            read -p "Type the name of your input interface, 's' to skip, '0' to go back: " interface_input                
                            if [[ $interface_input == "0" ]]; then
                                echo "Retuning back"
                                break
                            fi  
                            if [[ $interface_input == "s" ]]; then
                                echo "Skipping input interface IP input."
                            fi            

                            if  [[ $interface_input == "s" ]] || check_interface "$interface_input"; then
                                echo "Origin IP: $origin_ip"
                                echo "Destination IP: $destination_ip"
                                echo "Output Interface: $interface_output"
                                echo "Input Interface: $interface_input"
                                exit
                            fi
                        done
                
                    fi

                done
                
            fi
        done
    fi
done


