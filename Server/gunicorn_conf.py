
from melophony.utils import get_configuration


hostname = get_configuration('hostname', 'melophony.ddns.net')

bind = '0.0.0.0:1804'
certfile = f'/etc/letsencrypt/live/{hostname}/cert.pem'
keyfile = f'/etc/letsencrypt/live/{hostname}/privkey.pem'
workers = 3
threads = 2
