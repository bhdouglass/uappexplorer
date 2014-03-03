#!/bin/bash

apt-get update
apt-get upgrade -y
apt-get remove apache2
apt-get install -y nano bash-completion nginx python-pip python-pymongo mongodb python-requests

pip install cherrypy

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
bash $DIR/update_config.sh
