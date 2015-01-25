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
* Install dependencies:
    * Go to: `/srv/ubuntu-appstore/`
    * Run: `npm install`
* Run the spider:
    * Go to: `/srv/ubuntu-appstore/`
    * Run: `nodejs src/runSpider.js`
* Start the webserver:
    * Go to: `/srv/ubuntu-appstore/`
    * Run: `./start.sh`
* Visit the site:
    * In your browser go to: `192.168.52.200:8080`
    * You may want to put a friendly name in your host machine's `/etc/hosts`
* Profit!

## Using the Spider ##

* Fetch all packages
    * Run: `nodejs src/runSpider.js`
* Fetch only updated/missing packages
    * Run: `nodejs src/runSpider.js update`
* Fetch departments/categories
    * Run: `nodejs src/runSpider.js department`
* Fetch a single package
    * Run: `nodejs src/runSpider.js com.example.pacakge.name`

## Iron.io Workers ##

The appstore uses [iron.io](http://www.iron.io/) to process apps from the click
appstore api into the database. Setup an iron.io account and download the iron.json
config file to the repo root and install the [iron.io cli tool](http://dev.iron.io/worker/reference/cli/#installing).
Also setup a config.json file in the src directory containing the token and project
id from the iron.json file. The config.json file is setup just like the config.js.

The workers are:

* department.worker
    * Fetches all the departments and stores them in the database
    * No payload is needed
* package.worker
    * Fetches a single package and stores it in the database
    * Example payload: `{"package": "com.example.package.name"}`
* package-list.worker
    * Fetches the whole package list (or only updates) and creates package tasks
    * Payload to update all packages: `{"full": true}`
    * No payload needed to only do updates

To run the iron.io workers locally run `iron_worker run <worker_name>.worker`.

To upload the iron.io workers to iron.io run `iron_worker upload <worker_name>.worker`.

## Using The Local Prerender ##

* Start vagrant:
    * Run: `vagrant up`
    * Ssh into the box: `vagrant ssh`
* Install dependencies:
    * Go to: `/srv/ubuntu-appstore/prerender`
    * Run: `npm install`
* Start the prerender:
    * Go to: `/srv/ubuntu-appstore/prerender`
    * Run: `npm start`
* Test the prerender:
    * Visit an app url with `?_escaped_fragment_=`
    * Example: `192.168.52.200:8080/app/name?_escaped_fragment_=`
    * The page should be routed through the prerender, you can check the source as the prerender removes any script tags.

## Deploying ##

This app is currently designed to be deployed on [OpenShift](https://www.openshift.com).
The gear running the app needs to have the Nodejs and MongoDB cartridge setup.
This could be easily setup for a different service provided you setup the env variables.
To setup env variables on OpenShift, check out their [docs](https://developers.openshift.com/en/managing-environment-variables.html#custom-variables).

Alternatively an external mongo host could be used, like [MongoLab](https://mongolab.com/).

In addition to a server, the appstore also uses [iron.io](http://www.iron.io/),
see the section "Iron.io Workers" above for more details.

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
    * Default: `appstore.bhdouglass.com,local.appstore.bhdouglass.com,127.0.0.1,192.168.52.200`

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

Copyright (C) 2014 [Brian Douglass](http://bhdouglass.com/)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3, as published
by the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranties of MERCHANTABILITY, SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
