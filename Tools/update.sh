#!/bin/bash

echo "Update Melophony front-end"
echo "=========================="
echo ""

if [ "$EUID" -ne 0 ]; then
  echo "This script must be run as root"
  exit
fi

if [ $# -ne 1 ]; then
  echo "Hostname must be provided. Usage: sudo ./update.sh <hostname>"
  exit
fi

script_dir=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
melophony_dir=${script_dir%"/Tools"}
hostname=$1

cd $melophony_dir/App/
npm install
npm run build

cp ${melophony_dir}/Server/nginx_melophony.conf /etc/nginx/sites-available/melophony
sed -i "s/melophony.ddns.net/$hostname/g" /etc/nginx/sites-available/melophony
ln -sf /etc/nginx/sites-available/melophony /etc/nginx/sites-enabled/

mkdir -pv /var/www/$hostname/public/
chown -cR pi:pi /var/www/$hostname/public/

public_dir=${melophony_dir}/App/public

cp ${public_dir}/index.html /var/www/$hostname/public/
cp ${public_dir}/bundle.js /var/www/$hostname/public/
cp ${public_dir}/App.min.css /var/www/$hostname/public/
cp ${public_dir}/favicon.ico /var/www/$hostname/public/
cp -r ${public_dir}/img/ /var/www/$hostname/public/

# Optional: (re)install / renew Let's Encrypt certificate
read -r -p "Do you want to (re)install/renew the Let's Encrypt certificate for $hostname? [y/N] " answer
case "$answer" in
  [Yy]*)
    echo -e "\nWarning: port 80 must be open on your router (NAT) for certbot to validate the domain."
    read -r -p "Confirm port 80 is open and you want to continue? [y/N] " confirm
    case "$confirm" in
      [Yy]*)
        if ! command -v certbot >/dev/null 2>&1; then
          echo "certbot is not installed. Install it with: apt install certbot python3-certbot-nginx"
          exit 1
        fi
        echo "Running: certbot --nginx --rsa-key-size 4096 --no-redirect -d $hostname"
        certbot --nginx --rsa-key-size 4096 --no-redirect -d "$hostname"
        ;;
      *)
        echo "Certificate update cancelled."
        ;;
    esac
    ;;
  *)
    echo "Skipping certificate update."
    ;;
esac