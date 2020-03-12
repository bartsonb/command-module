#!/bin/bash

# get pid of node process, if available
read node_process <<< $(pidof node)
echo "Node process pid: ${node_process:-no process found}"

cd logs || exit

# Get the latest logfile filename
#  -1 lists one file per line
#  -r reverses output order (desc)
read logfile <<< $(ls -1 -r *.log)

# output data from logfile to console
#  -f    append data as the file grows
#  -n +1 output starting with line number given
tail -f -n +1 ${logfile}