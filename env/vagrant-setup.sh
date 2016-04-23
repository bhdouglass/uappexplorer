#!/bin/bash

apt-get install -y nginx
ln -s /srv/uappexplorer/env/proxy.conf /etc/nginx/conf.d/proxy.conf
service nginx restart

sed -i 's/#force_color_prompt/force_color_prompt/g' /home/vagrant/.bashrc
echo 'cd /srv/uappexplorer' >> /home/vagrant/.bashrc

ln -s /srv/uappexplorer/env/attach.sh /usr/local/bin/attach
ln -s /srv/uappexplorer/env/spider.sh /usr/local/bin/spider

chmod +x /usr/local/bin/attach
chmod +x /usr/local/bin/spider
