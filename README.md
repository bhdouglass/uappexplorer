# Ubuntu Appstore (Unofficial) #

Browse, download, and search apps from the Ubuntu click appstore - <http://appstore.bhdouglass.com/>.

While this app uses the Ubuntu click appstore api, it caches images and data to be kind to the api.

## Development ##

* Install [vagrant](http://vagrantup.com/):
    * Ubuntu: `sudo apt-get install vagrant`
    * Arch Linux: `pacman -S vagrant`
* Install vagrant plugins:
    * Run (may need sudo): `vagrant plugin install vagrant-omnibus vagrant-chef-zero vagrant-berkshelf`
* Start vagrant:
    * Run: `vagrant up`
    * Ssh into the box: `vagrant ssh`
* Start the webserver:
    * Go to: `/srv/ubuntu-appstore/`
    * Run: `npm start`
* Visit the site:
    * In your browser go to: `192.168.52.200:8080`
    * You may want to put a friendly name in your host machine's `/etc/hosts`
* Profit!

## License ##

Copyright (C) 2014 Brian Douglass

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3, as published 
by the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranties of MERCHANTABILITY, SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
