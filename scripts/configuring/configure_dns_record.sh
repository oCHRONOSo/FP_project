#!/bin/bash

# Check if the correct number of arguments are provided
if [ "$#" -ne 4 ]; then
    echo "Usage: $0 <config_file> <record_type> <value1> <value2>"
    exit 1
fi

config_file="/etc/bind/$1"
record_type="$2"
value1="$3"
value2="$4"

# Check if the configuration file exists
if [ ! -f "$config_file" ]; then
    echo "Error: Configuration file '$config_file' not found."
    exit 1
fi

if grep -q "^$value1\s\+IN\s\+$record_type\s\+$value2\s*$" "$config_file"; then
    echo "Record '$value1 IN $record_type $value2' already exists in '$config_file'."
else
    # Append the record to the configuration file
    echo -e "$value1\tIN\t$record_type\t$value2" >> "$config_file"
    echo "Record added successfully to $config_file"
fi
