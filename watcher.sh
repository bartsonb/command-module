#!/bin/bash

# Get the latest logfile filename
#  -1 lists one file per line 
#  -r reverses output order (desc)
#  2> redirects stderr to file, deleting error output
read logfile <<< $(ls -A -1 -r logs/*.log 2> /dev/null)

# Checking if a log file exist
#  -z checks if string is empty
[[ -z ${logfile} ]] && printf "[Logfile]: No logfile found.\n" && exit || printf "[Logfile]: ${logfile}\n\n"

# Output data from logfile to console
#  -f    append data as the file grows
#  -n +1 output starting with line number given
tail -f -n +1 ${logfile}