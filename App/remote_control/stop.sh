#!/bin/bash

kill_command () {
    if [ ! -z "$1" ]; then
        echo "Killing $1..."
        sudo kill -9 $1
    fi
}

export -f kill_command

sudo ps aux | grep -E "hid_mapper" | grep -v grep | awk '{print $2}' | xargs -I {} bash -c "kill_command {}"
