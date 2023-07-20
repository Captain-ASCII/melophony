#!/bin/bash

echo "Install Melophony"
echo "================="
echo ""

if [ "$EUID" -ne 0 ]; then
  echo "This script must be run as root"
  exit
fi

script_dir=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
melophony_dir=${script_dir%"/Tools"}

echo "Provide the hostname that will be used [melophony.ddns.net]:"
read -r hostname

if [[ "$hostname" -eq "" ]]; then
    hostname="melophony.ddns.net"
fi

djangoSecret=$(echo $RANDOM | md5sum | head -c 64; echo)
jwtSecret=$(echo $RANDOM | md5sum | head -c 32; echo)

config="{\"hostname\": \"$hostname\", \"djangoSecretKey\": \"$djangoSecret\", \"jwtSecret\": \"$jwtSecret\", \"isInDebugMode\": false}"

echo "Using the following configuration: $config"
echo "Check under /Server/configuration/configuration.json in order to change this configuration afterwards"
mkdir -p $melophony_dir/Server/configuration
echo "$config" > $melophony_dir/Server/configuration/configuration.json

echo "Start server install..."

cd $melophony_dir/Server/
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

echo "Server install done"
echo "Start front-end install..."

sudo ./update.sh $hostname

echo "Front-end install done"
echo ""
echo "================================="
echo "Run ./start.sh to start Melophony"
