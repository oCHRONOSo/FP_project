#!/bin/bash
# Define lease information
lease_ip="172.0.10.80"
lease_mac="00:11:22:33:44:54"
lease_hostname="example-host"
file="/etc/kea/kea-dhcp4.conf"

# Check if file exists
if [ ! -f "$file" ]; then
    echo "File not found: $file"
    exit 1
fi

# Count the number of lines between // a and // b
lines_between=$(awk '/\/\/ a/ {flag=1; next} /\/\/ b/ {flag=0} flag && !/\/\/ (a|b)/ {count++} END {print count}' "$file")
if [ -z "$lines_between" ]; then
    lines_between=0
fi
echo $lines_between
if [ ! "$lines_between" -gt 0 ]; then
    # Insert "reservations": [] between // a and // b within the subnet4 section
    awk '/"subnet4"/,/\],/{flag=1} /\/\/ a/{if(flag){a=NR+1}} /\/\/ b/{if(flag && NR>a+1){exit} else if(flag){print "    \"reservations\": [\n],"}; flag=0} 1' "$file" > temp && mv temp "$file"
    echo "Inserted 'reservations': [] between // a and // b within the subnet4 section"
    lines_between=1
fi

# Check if there is content between // a and // b within the subnet4 section
if [ "$lines_between" -gt 0 ]; then
    echo "Content exists between // a and // b within the subnet4 section"

    # Prepare lease entry
    lease_entry=$(cat <<EOF
{
    "ip-address": "$lease_ip",
    "hw-address": "$lease_mac",
    "hostname": "$lease_hostname"
}
EOF
)

    # Check if there are existing leases
    existing_leases=$(awk '/"reservations": \[/,/]/' "$file" | grep -c '"ip-address"')

    if [ $existing_leases -gt 0 ]; then
        echo "There are existing leases."
        awk -v lease_entry="$lease_entry" '
        /reservations/,/\]/ {
            if ($0 ~ /\]/) {
                print ",", lease_entry, "\n", $0 ;
            } else {
                print $0;
            }
            next;
        }
        1
        ' "$file" > temp.json && mv temp.json "$file"


    else
        # Insert lease into reservations
        awk -v lease="$lease_entry" '/"reservations": \[/ {print; printf "\t%s\n", lease; next} 1' "$file" > temp.json && mv temp.json "$file"
        echo "Lease added successfully."
    fi
fi

