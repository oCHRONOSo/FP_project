#!/bin/bash


ip_address="172.0.10.80"
file_path="/etc/kea/kea-dhcp4.conf"

# Check if file exists
if [ ! -f "$file_path" ]; then
    echo "File not found: $file_path"
    exit 1
fi

# Remove block with provided IP address
temp_file=$(mktemp)
found=0

while read -r line; do
    # Check if the line contains the IP address
    if grep -q "\"ip-address\": \"$ip_address\"" <<< "$line"; then
        found=1
        # Skip lines until the next block starts
        while read -r next_line; do
            if [[ "$next_line" == *} ]]; then
                break
            fi
        done
        continue
    fi

    # Write the line to temp file
    echo "$line" >> "$temp_file"
done < "$file_path"

# If no block was found, exit
if [ "$found" -eq 0 ]; then
    echo "IP address $ip_address not found in the file."
    rm "$temp_file"
    exit 1
fi

# Replace the original file with the temp file
mv "$temp_file" "$file_path"


filterline() {
    # Create a temporary file
    temp_file=$(mktemp)

    # Initialize a variable to keep track of the previous line
    prev_line=""

    # Read the input line by line from the input file
    while IFS= read -r line; do
        # Check if the previous line and the current line both contain ", {"
        if [[ $prev_line == *,\ \{ && $line == *,\ \{ ]]; then
            # If both lines contain ", {", skip printing the current line
            continue
        fi
        
        # Print the previous line (if it's not empty) to the temporary file
        if [ -n "$prev_line" ]; then
            echo "$prev_line" >> "$temp_file"
        fi
        
        # Set the current line as the previous line for the next iteration
        prev_line="$line"
    done < "$1"  # Input redirection from the input file

    # Print the last line if it's not empty to the temporary file
    if [ -n "$prev_line" ]; then
        echo "$prev_line" >> "$temp_file"
    fi

    # Replace the input file with the temporary file
    mv "$temp_file" "$1"
}

# Example usage:
# Modify input_file.txt directly
filterline "$file_path"


echo "Block containing IP address $ip_address removed successfully."
