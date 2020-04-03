#!/bin/bash

# Get pid of node process
read node_pid <<< $(pidof node)
printf "[Node PID]: ${node_pid:-No node process found.}\n\n"

# Exiting if no node process was found
[ -z ${node_pid} ] && exit

# Start strace to get node process output
# -f    folow forks, child processes
# -e    only output POSIX write calls
# 2>&1  pipes the strace stderr output to stdout
# -o    only returns the match
# -P    Pattern is Perl regular expressions
sudo strace -p${node_pid} -f -s9999 -e write 2>&1 | grep -oP '(?<=")(\d{4}.+?)(?=\\n)'