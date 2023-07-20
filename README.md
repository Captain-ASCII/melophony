
# Melophony

Melophony is a self-hosted application to manage & play music among different clients such as a browser or the associated web-application.

With it, you can easily listen to your favorite music while keeping everything synchronized on your different devices:
* Add tracks coming from different sources so you can get album or live versions of your favorite tracks.
* Associate them to playlists to easily listen to an album you like but without the tracks you may always skip.
* Listen to music freely even without internet access when using the [Melophony web-application](https://github.com/Captain-ASCII/melophony-webapp).
* A Raspberry PI is enough to host the server

The Melophony project is currently composed of four elements:
* The front-end application in this repository built with Typescript
* The back-end server built in Python with the Django framework (also in this repository)
* The track providers that one can add to his/her own server to add tracks to Melophony
* The [Melophony web-application](https://github.com/Captain-ASCII/melophony-webapp) to listen to the Music without a network connection

# Install

## Requirements

* A machine connected to the network and with the following dependencies installed:
  * Nginx
  * Python 3

The first step is to install the server on your own machine and add the front-end bundle to Nginx.
This is done with a simple script to run once the code and the tools have been downloaded.
On the target machine, clone the repository:

```
$ git clone git@github.com:Captain-ASCII/melophony.git
```

Run the install script, this will install all the required dependencies:

```
$ cd melophony/Tools
$ sudo ./install.sh # Run with the root permissions as we install Melophony under /var/www/
```

Done!

# Usage

Using Melophony is now as simple as using the two commands provided in the Tools directory:

```
$ ./start.sh # To start serving Melophony
$ ./stop.sh # To stop everything
```

It is now possible to get to Melophony on the port 443 of the machine.

# Update

If you have made modifications to the Melophony code or a new release version is available, you can update Melophony using the following script:

```
$ sudo ./update.sh # Run with the root permissions as we install Melophony under /var/www/
```