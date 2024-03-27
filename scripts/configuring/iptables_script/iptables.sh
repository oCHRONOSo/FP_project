#!/bin/bash

# Output the welcome line

figlet iptables


# FIRST QUESTION : Table to edit

while true; do 

    # Set the question for the user
    read -p "Please, select the table in which you want to add a new rule:
    [1] filter
    [2] nat
    [3] mangle
    [4] raw
    [0] exit

    Your choice: " TABLE

    # Change the "TABLE" variable depending on the user's choice
    case $TABLE in
        0)
            echo "----------------"
            echo "Exiting..."
            echo "----------------"
            exit
            ;;
        1) 
            echo "----------------"
            echo "Okay!"
            echo "----------------"
            #sleep 1
            TABLE=filter
            
            #Ask to which chain should we apply changes
            read -p "Which chain do you want to add this rule to?
            [1] INPUT
            [2] OUTPUT
            [3] FORWARD
            [4] PREROUTING
            [5] POSTROUTING
            [0] exit

            Your choice: " ACTION

            # Change the "ACTION" variable depending on the user's choice
            case $ACTION in
            0)
                echo "----------------"
                echo "Exiting..."
                echo "----------------"
                exit
                ;;
            1) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="INPUT"
                break
                ;;
            2) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="OUTPUT"
                break
                ;;
            3) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="FORWARD"
                break
                ;;
            4) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="PREROUTING"
                break
                ;;
            5) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="POSTROUTING"
                break
            esac

            break 
            ;;
        2) 
            echo "----------------"
            echo "Okay!"
            echo "----------------"
            #sleep 1
            TABLE=nat
            
            #Ask to which chain should we apply changes
            read -p "Which chain do you want to add this rule to?
            [1] PREROUTING
            [2] POSTROUTING
            [3] OUTPUT
            [0] exit

            Your choice: " ACTION

            # Change the "ACTION" variable depending on the user's choice
            case $ACTION in
            0)
                echo "----------------"
                echo "Exiting..."
                echo "----------------"
                exit
                ;;
            1) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="PREROUTING"
                break
                ;;
            2) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="POSTROUTING"
                break
                ;;
            3) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="OUTPUT"
                break
            esac

            break
            ;;
        3) 
            echo "----------------"
            echo "Okay!"
            echo "----------------"
            #sleep 1
            TABLE=mangle

            #Ask to which chain should we apply changes
            read -p "Which chain do you want to add this rule to?
            [1] INPUT
            [2] OUTPUT
            [3] FORWARD
            [4] PREROUTING
            [5] POSTROUTING
            [0] exit

            Your choice: " ACTION

            # Change the "ACTION" variable depending on the user's choice
            case $ACTION in
            0)
                echo "----------------"
                echo "Exiting..."
                echo "----------------"
                exit
                ;;
            1) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="INPUT"
                break
                ;;
            2) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="OUTPUT"
                break
                ;;
            3) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="FORWARD"
                break
                ;;
            4) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="PREROUTING"
                break
                ;;
            5) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="POSTROUTING"
                break
            esac

            break
            ;;

        4) 
            echo "----------------"
            echo "Okay!"
            echo "----------------"
            #sleep 1
            TABLE=raw

            #Ask to which chain should we apply changes
            read -p "Which chain do you want to add this rule to?
            [1] PREROUTING
            [2] OUTPUT
            [0] exit

            Your choice: " ACTION

            # Change the "ACTION" variable depending on the user's choice
            case $ACTION in
            0)
                echo "----------------"
                echo "Exiting..."
                echo "----------------"
                exit
                ;;
            1) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="PREROUTING"
                break
                ;;
            2) 
                echo "----------------"
                echo "Okay!"
                echo "----------------"
                #sleep 1
                ACTION="OUTPUT"
                break                 
            esac

            break
            ;;
        *)
            echo "Invalid choice. Please enter a number from the menu."
            #sleep 1
            
    esac    

done


# SECOND QUESTION: Is the rule going to be a policy one or a regular one?

while true; do 

    # Set the question for the user
    read -p "Do you want this rule to be the policy by default or a regular rule?
    [1] Policy by default
    [2] Regular one
    [0] exit

    Your choice: " TYPE

    # Change the "TYPE" variable depending on the user's choice
    case $TYPE in
        0)
            echo "----------------"
            echo "Exiting..."
            echo "----------------"
            exit
            ;;
        1) 
            echo "----------------"
            echo "Okay!"
            echo "----------------"
            #sleep 1
            TYPE=P
            break
            ;;
        2) 
            echo "----------------"
            echo "Okay!"
            echo "----------------"
            #sleep 1
            TYPE=A
            break
            ;;
        *)
            echo "----------------"
            echo "Invalid choice. Please enter a number from the menu."
            echo "----------------"
            #sleep 1
            ;;
    esac

done


# THIRD QUESTION: Choosing the protocol

while true; do 

    # Set the question for the user
    read -p "Please, if any, specify which protocol you want to manage (DNS, HTTP...). Else, press Enter to go to the next question or "0" to exit the program.
    
    Your choice: " PROTOCOL

    # Check if the protocol exists on our protocols list
    if [ "$PROTOCOL" == "0" ]; then
        echo "----------------"
        echo "Exiting..."
        echo "----------------"
        exit
    elif [ "$PROTOCOL" == "" ]; then
        break 
    elif [ "$(cat protocols.txt | grep -i $PROTOCOL)" != "" ]; then
        #If it exists, set the variables for protocol, port and transport protocol
        echo "----------------"
        echo "Okay!"
        echo "----------------"
        #sleep 1
        PORT=$(cat protocols.txt | grep -i $PROTOCOL | cut -d ':' -f 2)
        TRANS=$(cat protocols.txt | grep -i $PROTOCOL | cut -d ':' -f 3)
        break
    else
        echo "Protocol $PROTOCOL not found."
        read -p "Do you wanna set it manually by specifying the port number / transport protocol ? (y/n): " YN
        if [ "$YN" == "y" ]; then
            read -p "Enter your port number : " PORT
            read -p "Enter your transport protocol (tcp/udp) : " TRANS
            break
        fi
    fi 

done  


# FOURTH QUESTION: Choosing the protocol
# Function to validate an IP address
validate_ip() {
    local IP=$1
    local REGEX="^([0-9]{1,3}\.){3}[0-9]{1,3}$"
    
    if [[ $IP =~ $REGEX ]]; then
        # Split the IP address into octets
        IFS='.' read -r -a octets <<< "$IP"
        
        # Check each octet
        for octet in "${octets[@]}"; do
            if ! [[ $octet -ge 0 && $octet -le 255 ]]; then
                echo "Invalid IP address: $IP"
                return 1
            fi
        done
        
        echo "Valid IP address: $IP"
        return 0
    else
        echo "Invalid IP address format: $IP"
        return 1
    fi
}


#function to check the interface


check_interface() {
    local INTERFACE=$1
    if [[ -z $(ip link show "$INTERFACE" 2>/dev/null) ]]; then
        echo "INTERFACE $INTERFACE does not exist."
        return 1
    elif [[ $(ip link show "$INTERFACE" | grep -c "state UP") -eq 0 ]]; then
        echo "INTERFACE $INTERFACE is not activated."
        return 1
    else
        echo "INTERFACE $INTERFACE exists and is activated."
        return 0
    fi
}

condition=true
while $condition ; do
    read -p "Type the origin IP address, Enter to skip, '0' to go back : " ORG_IP
    if [[ $ORG_IP == "0" ]]; then
        echo "----------------"
        echo "Retuning back"
        echo "----------------"
        break
    fi


    if [[ $ORG_IP == "" ]]; then
        echo "----------------"
        echo "Skipping origin IP input."
        echo "----------------"
    fi
    


    if [[ $ORG_IP == "" ]] || validate_ip "$ORG_IP"; then
        while $condition; do
            echo "----------------"
            echo "Okay!"
            echo "----------------"
            #sleep 1
            read -p "Type the destination IP address, Enter to skip, '0' to go back: " DST_IP
            if [[ $DST_IP == "0" ]]; then
                ""
                break
            fi            
            if [[ $DST_IP == "" ]]; then
                echo "---------------"
                echo "Skipping destination IP input."
                echo "---------------"
            fi


            if  [[ $DST_IP == "" ]] || validate_ip "$DST_IP"; then
                while $condition; do
                    read -p "Type the name of your output interface, Enter to skip, '0' to go back: " INTERFACE_OUTPUT                   
                    if [[ $INTERFACE_OUTPUT == "0" ]]; then
                        echo "----------------"
                        echo "Retuning back"
                        echo "----------------"
                        break
                    fi  
                    if [[ $INTERFACE_OUTPUT == "" ]]; then
                        echo "---------------"
                        echo "Skipping output interface input."
                        echo "---------------"
                    fi   


                    if  [[ $INTERFACE_OUTPUT == "" ]] || check_interface "$INTERFACE_OUTPUT"; then
                        while $condition; do
                            read -p "Type the name of your input interface, Enter to skip, '0' to go back: " INTERFACE_INPUT                
                            if [[ $INTERFACE_INPUT == "0" ]]; then
                                echo "----------------"
                                echo "Retuning back"
                                echo "----------------"
                                break
                            fi  
                            if [[ $INTERFACE_INPUT == "" ]]; then
                                echo "---------------"
                                echo "Skipping input interface IP input."
                                echo "---------------"                        
                            fi            
                            

                            if  [[ $INTERFACE_INPUT == "" ]] || check_interface "$INTERFACE_INPUT"; then
                            #     echo "Origin IP: $ORG_IP"
                            #     echo "Destination IP: $DST_IP"
                            #     echo "Output Interface: $INTERFACE_OUTPUT"
                            #     echo "Input Interface: $INTERFACE_INPUT"
                            #     exit
                                condition=false
                            fi
                        done
                
                    fi

                done
                
            fi
        done
    fi
done





# EIGHTH QUESTION: username

while true; do 

    # Set the question for the user
    read -p "Please, if needed, type the name of the user you want to manage. Else, press Enter to go to the next question or "0" to exit the program.
    
    Your choice: " USER

    # Check if the protocol exists on our protocols list
    if [ "$USER" == "0" ]; then
        echo "----------------"
        echo "Exiting..."
        echo "----------------"
        exit
    elif [ "$USER" == "" ]; then
        break 
    elif id $USER &>/dev/null; then
        #If the usert exists, keep going
        echo "----------------"
        echo "Okay!"
        echo "----------------"
        ##sleep 1
        break
    else 
        echo "----------------"
        echo "The user doesn't exist"
        echo "----------------"
    fi 

done  



# NINTH QUESTION: add a log

while true; do
    read -p "Do you want to accept, drop or create a log for this traffic? Press Enter to go to the next question or "0" to exit the program. 
    [1] ACCEPT
    [2] DROP
    [3] LOG
    [0] Exit
    
    Your choice: " FINAL_ACTION

    case $FINAL_ACTION in
        0)
            echo "----------------"
            echo "Exiting..."
            echo "----------------"
            exit 
            ;;
        1)
            FINAL_ACTION="ACCEPT"
            echo "----------------"
            echo "Adding rule..."
            echo "----------------"
            ##sleep 1
            echo "The new rule was added. Use 'iptables -t $TABLE -S' to check the result"
            echo "----------------"
            ##sleep 1
            break
            ;;
        2)
            FINAL_ACTION="DROP"
            echo "----------------"
            echo "Adding rule..."
            echo "----------------"
            ##sleep 1
            echo "The new rule was added. Use 'iptables -t $TABLE -S' to check the result"
            echo "----------------"
            ##sleep 1
            break
            ;;
        3)
            FINAL_ACTION="LOG"
            read -p "Please, type the tag you’d like to attach to the log entry: 
            
            Your choice: " $LOG_TAG
            
            echo "----------------"
            echo "Adding rule with log tag '$LOG_TAG'..."
            echo "----------------"
            #sleep 1
            echo "The new rule was added. Use 'iptables -t $TABLE -S' to check the result"
            echo "----------------"
            #sleep 1
            break
            ;;
        *)
            echo "----------------"
            echo "Invalid choice. Please enter a number from the menu."
            echo "----------------"
            
    esac
done


# FINAL FUNCTIONS

#Function to add the transport protocol if a protocol was added
add_transport_protocol() {
    if [[ $PROTOCOL != "" ]]; then 
        COMMAND+=" -p $TRANS"
    fi
}

#Function to add ports depending on the ACTION
add_ports() {

    if [[ $PROTOCOL != "" ]]; then 
        if [[ $ACTION == "INPUT" ]] || [[ $ACTION == "FORWARD" ]] || [[ $ACTION == "PREROUTING" ]]; then     
            COMMAND+=" --sport $PORT"
        fi 
        if [[ $ACTION == "OUTPUT" ]] || [[ $ACTION == "FORWARD" ]] || [[ $ACTION == "POSTROUTING" ]]; then
            COMMAND+=" --dport $PORT"
        fi 
    elif [[ $ORG_PORT != "" ]] || [[ $DST_PORT != "" ]]; then 
        if [[ $ORG_PORT != "" ]]; then 
            COMMAND+=" --sport $ORG_PORT"
        fi
        if [[ $DST_PORT != "" ]]; then 
            COMMAND+=" --dport $DST_PORT"
        fi
    fi
}

#Function to add the output interface
add_output_interface() {
    if [[ $INTERFACE_OUTPUT != "" ]]; then 
        COMMAND+=" -o $INTERFACE_OUTPUT"
    fi
}

#Function to add the input interface
add_input_interface() {
    if [[ $INTERFACE_INPUT != "" ]]; then 
        COMMAND+=" -i $INTERFACE_INPUT"
    fi
}

#Function to add the origin IP
add_origin_ip() {
    if [[ $ORG_IP != "" ]]; then 
        COMMAND+=" -s $ORG_IP"
    fi
}

#Function to add the destination IP
add_destination_ip() {
    if [[ $DST_IP != "" ]]; then 
        COMMAND+=" -d $DST_IP"
    fi
}

#Function to add the user
add_user() {
    if [[ $USER != "" ]]; then 
        COMMAND+=" -m owner --uid-owner $USER"
    fi
}

#Function to add the final action
add_final_action() {
    COMMAND+=" -j $FINAL_ACTION"
    if [[ $FINAL_ACTION == "LOG" ]]; then 
        COMMAND+=" --log-prefix $LOG_TAG"
    fi
}

#Function to create the final command
create_rule() {
    COMMAND="iptables -t $TABLE -$TYPE $ACTION"
    add_transport_protocol
    add_ports
    add_origin_ip
    add_destination_ip
    add_input_interface
    add_output_interface
    add_user
    add_final_action
}

create_rule
echo "$COMMAND"
#$(echo $COMMAND)


