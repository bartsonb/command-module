#!/bin/bash

# Checking if logs folder exists
cd logs || exit

# Checking if any log files exist
#  -z checks if string is empty
#  2> redirects stderr to file
if [ -z "$(ls *.log 2> /dev/null)" ]
then
    printf "[Logfile]: No logfile found.\n" && exit
else 
    # Get the latest logfile filename
    #  -1 lists one file per line 
    #  -r reverses output order (desc)
    read logfile <<< $(ls -1 -r *.log)
    printf "[Logfile]: ${logfile}\n\n"

    # output data from logfile to console
    #  -f    append data as the file grows
    #  -n +1 output starting with line number given
    tail -f -n +1 ${logfile}
fi