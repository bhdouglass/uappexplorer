# Ubuntu Appstore (Unofficial) #

[ ![Codeship Status for bhdouglass/ubuntu-appstore](https://codeship.com/projects/6a279da0-64a5-0132-af74-0639b0c195d6/status?branch=master)](https://codeship.com/projects/52618)

Browse, download, and search apps from the Ubuntu click appstore - [appstore.bhdouglass.com](http://appstore.bhdouglass.com/).

While this app uses the Ubuntu [click appstore api](https://wiki.ubuntu.com/AppStore/Interfaces/ClickPackageIndex),
it caches images and data to be kind to the api.

## Development ##

* Install [vagrant](http://vagrantup.com/):
    * Ubuntu: `sudo apt-get install vagrant`
    * Arch Linux: `pacman -S vagrant`
* Install vagrant plugins:
    * Run (may need sudo): `vagrant plugin install vagrant-omnibus vagrant-chef-zero vagrant-berkshelf`
* Start vagrant:
    * Run: `vagrant up`
    * Ssh into the box: `vagrant ssh`
* Insall Dependencies:
    * Go to: `/srv/ubuntu-appstore/`
    * Run: `npm install`
* Run the spider:
    * Go to: `/srv/ubuntu-appstore/`
    * Run: `nodejs src/runSpider.js`
* Start the webserver:
    * Go to: `/srv/ubuntu-appstore/`
    * Run: `npm start`
* Visit the site:
    * In your browser go to: `192.168.52.200:8080`
    * You may want to put a friendly name in your host machine's `/etc/hosts`
* Profit!

## Deploying ##

This app is currently designed to be deployed on [OpenShift](https://www.openshift.com).
The gear running the app needs to have the Nodejs and MongoDB cartridge setup.
This could be easily setup for a different service provided you setup the env variables.

## Env Variables ##

* NODEJS_PORT || OPENSHIFT_NODEJS_PORT
    * The port for the web server to listen on
    * Default: `8080`
* NODEJS_IP || OPENSHIFT_NODEJS_IP
    * IP address for the web server to listen on
    * Default: `127.0.0.1`
* DATA_DIR || OPENSHIFT_DATA_DIR
    * Directory where downloaded images are stored
    * Default: `/tmp`
* MONGODB_URI || OPENSHIFT_MONGODB_DB_URL
    * The uri used to connect to MongoDB (may contain username/password)
    * Default: `mongodb://localhost/`
* MONGODB_DB
    * Name of the database to use
    * Default: `appstore`

## Libraries ##

The following third party libraries are used in this app:

* Server Side
    * [Express](http://expressjs.com/)
    * [Mongoose](http://mongoosejs.com/)
    * [Lo-Dash](https://lodash.com/)
    * [Request](https://github.com/request/request)
    * [Async](https://github.com/caolan/async)
* Client Side
    * [Bootstrap](http://getbootstrap.com/)
    * [jQuery](http://jquery.com/)
    * [FontAwesome](http://fontawesome.io/)
    * [AngularJS](https://angularjs.org/)
    * [Angular UI](http://angular-ui.github.io/)
    * [Lo-Dash](https://lodash.com/)
    * [fancyBox](http://fancyapps.com/fancybox/)

## License ##

Copyright (C) 2014 [Brian Douglass](http://bhdouglass.com/)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3, as published
by the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranties of MERCHANTABILITY, SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
