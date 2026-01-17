#!/bin/bash

# This script is used to cat all TypeScript files in the specified directories and files
# to feed in as context to a Claude project.

# Exit on error
set -e

# Check if any paths were provided as arguments
if [ $# -eq 0 ]; then
   echo "Error: No paths specified" >&2
   echo "Usage: $0 path1 path2 path3 ..." >&2
   echo "Paths can be either directories or files" >&2
   exit 1
fi

# Process each argument
for path in "$@"; do
   # Check if path exists
   if [ ! -e "$path" ]; then
       echo "Warning: Path $path not found" >&2
       continue
   fi

   # If it's a directory, find and process TypeScript files
   if [ -d "$path" ]; then
       find "$path" -name "*.ts" -type f |grep -v '.test-d.ts' | grep -v '.test.ts' | while read -r file; do
           echo -e "\n// File: $file"
           echo "// ----------------------------------------"
           cat "$file"
           echo -e "\n"
       done
   # If it's a file, process it directly
   elif [ -f "$path" ]; then
       echo -e "\n// File: $path"
       echo "// ----------------------------------------"
       cat "$path"
       echo -e "\n"
   fi
done
