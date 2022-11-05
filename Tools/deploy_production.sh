#!/bin/bash

echo "Deploy Melophony's Nginx assets"

if [ "$EUID" -ne 0 ]; then
  echo "This script must be run as root"
  exit
fi

script_dir=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
melophony_dir=${script_dir%"/Tools"}

cp ${melophony_dir}/Server/nginx_melophony.conf /etc/nginx/sites-available/melophony
ln -sf /etc/nginx/sites-available/melophony /etc/nginx/sites-enabled/

mkdir -pv /var/www/melophony.ddns.net/public/
chown -cR pi:pi /var/www/melophony.ddns.net/public/

public_dir=${melophony_dir}/App/public

cp ${public_dir}/index.html /var/www/melophony.ddns.net/public/
cp ${public_dir}/bundle.js /var/www/melophony.ddns.net/public/
cp ${public_dir}/App.min.css /var/www/melophony.ddns.net/public/
cp ${public_dir}/favicon.ico /var/www/melophony.ddns.net/public/
cp -r ${public_dir}/img/ /var/www/melophony.ddns.net/public/

systemctl restart nginx