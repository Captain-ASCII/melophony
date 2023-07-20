

echo "Update Melophony front-end"
echo "=========================="
echo ""

if [ "$EUID" -ne 0 ]; then
  echo "This script must be run as root"
  exit
elif [ $# -ne 1 ]; then
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