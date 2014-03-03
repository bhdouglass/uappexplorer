#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

rm /etc/nginx/sites-enabled/default
rm /etc/nginx/sites-enabled/localhost
cp $DIR/config/localhost /etc/nginx/sites-enabled/localhost
service nginx reload

service ubuntu_appstore stop
rm /etc/init/ubuntu_appstore.conf
cp $DIR/config/ubuntu_appstore.upstart.conf /etc/init/ubuntu_appstore.conf
service ubuntu_appstore start

rm /etc/cron.daily/ubuntu_appstore_spider
ln -s /ubuntu-appstore/spider/run_spider.sh /etc/cron.daily/ubuntu_appstore_spider
