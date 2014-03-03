#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

rm /etc/nginx/sites-enabled/default
rm /etc/nginx/sites-enabled/localhost
cp $DIR/config/localhost /etc/nginx/sites-enabled/localhost
service nginx restart

service ubuntu_appstore stop
rm /etc/init/ubuntu_appstore.conf
cp $DIR/config/ubuntu_appstore.upstart.conf /etc/init/ubuntu_appstore.conf
service ubuntu_appstore start

rm /etc/cron.d/ubuntu_appstore
ln -s /ubuntu-appstore/env/config/ubuntu_appstore.crontab /etc/cron.d/ubuntu_appstore
