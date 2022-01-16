#!/bin/bash

kill_command () {
    if [ ! -z "$1" ]; then
        echo "Killing $1..."
        sudo kill -9 $1
    fi
}

export -f kill_command

sudo lsof -i | grep -E "1804|1958|nodejs.*\*:log-server" | grep -v grep | awk '{print $2}' | xargs -I {} bash -c "kill_command {}"
sudo ps aux | grep -E "nodejs.*server.js" | grep -v grep | awk '{print $2}' | xargs -I {} bash -c "kill_command {}"
