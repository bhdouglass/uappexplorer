# Ubuntu Appstore (Unofficial) #

[ ![Codeship Status for bhdouglass/ubuntu-appstore](https://codeship.com/projects/6a279da0-64a5-0132-af74-0639b0c195d6/status?branch=master)](https://codeship.com/projects/52618)

Browse, download, and search apps from the Ubuntu click appstore - [appstore.bhdouglass.com](http://appstore.bhdouglass.com/).

While this app uses the Ubuntu [click appstore api](https://wiki.ubuntu.com/AppStore/Interfaces/ClickPackageIndex),
it caches images and data to be kind to the api.

## Development ##

* Install [vagrant](http://vagrantup.com/):
    * Ubuntu: `sudo apt-get install vagrant`
    * Arch Linux: `pacman -S vagrant`
* Install [docker](https://www.docker.com/)
    * Ubuntu: `sudo apt-get install docker.io`
    * Arch Linux: `pacman -S docker`
* Install NPM dependencies:
    * Run: `npm install`
* Start vagrant:
    * Run: `vagrant up --no-parallel`
* Run the spider:
    * Run: `vagrant docker-run web -- node /srv/ubuntu-appstore/src/runSpider.js`
* Attach to the docker container (if needed):
    * Run: `docker attach --sig-proxy=false appstore_web`
* Visit the site:
    * In your browser go to: `localhost:8080`
    * You may want to put a friendly name in your host machine's `/etc/hosts`
* Profit!

## Using the Spider ##

* Fetch all packages
    * Run: `vagrant docker-run web -- node /srv/ubuntu-appstore/src/runSpider.js`
* Fetch only updated/missing packages
    * Run: `nvagrant docker-run web -- node /srv/ubuntu-appstore/src/runSpider.js update`
* Fetch departments/categories
    * Run: `vagrant docker-run web -- node /srv/ubuntu-appstore/src/runSpider.js department`
* Fetch a single package
    * Run: `vagrant docker-run web -- node /srv/ubuntu-appstore/src/runSpider.js com.example.pacakge.name`

## Using The Local Prerender ##

* Install dependencies:
    * Go to: `./prerender`
    * Run: `npm install`
* Start the prerender:
    * Run: `vagrant docker-run web -- node /srv/ubuntu-appstore/prerender/server.js`
* Test the prerender:
    * Visit an app url with `?_escaped_fragment_=`
    * Example: `localhost/app/name?_escaped_fragment_=`
    * The page should be routed through the prerender, you can check the source as the prerender removes any script tags.

## Deploying ##

This app is currently designed to be deployed on [OpenShift](https://www.openshift.com).
The gear running the app needs to have the Nodejs and MongoDB cartridge setup.
This could be easily setup for a different service provided you setup the env variables.
To setup env variables on OpenShift, check out their [docs](https://developers.openshift.com/en/managing-environment-variables.html#custom-variables).

Alternatively an external mongo host could be used, like [MongoLab](https://mongolab.com/).

## Configuration ##

Default configuration can be found in src/config.js. The defaults can be overriden
by a config.json file (setup like config.js's export). They can also be overriden
by the following env variables.

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
* PRERENDER_SERVICE_URL
    * Url to use for prerendering
    * Default: `http://service.prerender.io/`
* ALLOWED_DOMAINS
    * The domains the local prerender server allows
    * Default: `appstore.bhdouglass.com,local.appstore.bhdouglass.com,127.0.0.1,localhost`

## Libraries ##

The following third party libraries are used in this app:

* Server Side
    * [Express](http://expressjs.com/)
    * [Mongoose](http://mongoosejs.com/)
    * [Lo-Dash](https://lodash.com/)
    * [Request](https://github.com/request/request)
    * [Async](https://github.com/caolan/async)
    * [Moment.js](http://momentjs.com/)
    * [prerender-node](https://github.com/prerender/prerender-node#using-your-own-prerender-service)
    * [prerender](https://github.com/prerender/prerender)
* Client Side
    * [Bootstrap](http://getbootstrap.com/)
    * [jQuery](http://jquery.com/)
    * [FontAwesome](http://fontawesome.io/)
    * [AngularJS](https://angularjs.org/)
    * [Angular UI](http://angular-ui.github.io/)
    * [Lo-Dash](https://lodash.com/)
    * [fancyBox](http://fancyapps.com/fancybox/)

## License ##

Copyright (C) 2015 [Brian Douglass](http://bhdouglass.com/)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3, as published
by the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranties of MERCHANTABILITY, SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
