#!/bin/bash

# Get pid of node process, if available
read node_process <<< $(pidof node)
echo "Node process pid: ${node_process:-no node process detected}"

# Start strace to get node process output
# -f    folow forks, child processes
# -e    only output POSIX write calls
# 2>&1  pipes the strace stderr output to stdout
# -o    only returns the match
# -P    Pattern is Perl regular expressions
sudo strace -p${node_process} -f -s9999 -e write 2>&1 | grep -oP '(?<=")(\d{4}.+?)(?=\\n)'