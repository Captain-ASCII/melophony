
# Deployement notice for Melophony on a Raspberry PI

## Dependencies

Here are the required dependencies in order to run Melophony in a production environment:

* nginx
* npm
* python3
* certbot
* python3-venv
* python3-certbot-nginx
* gunicorn
* libopenjp2-7

## Back-end preparation

First, create the python3 virtual environment using venv:

```
python3 -m venv venv
```

Then, install the requirements with:

```
. venv/bin/activate
pip install -r requirements.txt
```


## Front-end build

The front-end javascript bundle must be rebuilt so it can be used by Nginx.
In the App directory, run the following command:

```npm install```

Then, run:

```
npm run build
```

This will create necessary files in the public directory:

* App.min.css
* bundle.js

## Deployment

The created files need to be deployed in a directory accessible by Nginx, to copy the built files to this new directory, run:

```
sudo ./deploy_production.sh
```

The script will create the directory, copy static files to it and restart the nginx server.

## SSL Certificate

A certificate must be used in order to use HTTPS with Melophony. To create the certificate, follow this process:

```
sudo certbot --nginx --rsa-key-size 4096 --no-redirect
```

Once these steps have been done, the Melophony server should be available.