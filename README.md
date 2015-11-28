# uApp Explorer #

[ ![uApp Explorer](https://uappexplorer.com/img/app-logo.png)](https://uappexplorer.com/)

![Codeship Status](https://img.shields.io/codeship/6a279da0-64a5-0132-af74-0639b0c195d6/master.svg)
![Github Stars](https://img.shields.io/github/stars/bhdouglass/uappexplorer.svg)
![Github Issues](https://img.shields.io/github/issues-raw/bhdouglass/uappexplorer.svg)
![License](https://img.shields.io/github/license/bhdouglass/uappexplorer.svg)
[ ![Gratipay](https://img.shields.io/gratipay/bhdouglass.svg) ](https://gratipay.com/bhdouglass/)

Browse and search apps from the Ubuntu Touch click appstore -
[uappexplorer.com](https://uappexplorer.com/).

uApp Explorer uses publically available data from the Ubuntu Touch
[click appstore api](https://wiki.ubuntu.com/AppStore/Interfaces/ClickPackageIndex),
It is maintained by [Brian Douglass](http://bhdouglass.com) and is not
endorsed by or affiliated with Ubuntu or Canonical. Ubuntu and Canonical are
registered trademarks of [Canonical Ltd.](http://www.canonical.com/)

## Development ##

* Install [vagrant](http://vagrantup.com/) and [docker](https://www.docker.com/):
    * Ubuntu: `sudo apt-get install vagrant docker.io`
    * Arch Linux: `pacman -S vagrant docker`
* Install NPM dependencies:
    * Run: `npm install`
    * Run: `cd www && npm install`
* Install gulp and bower:
    * Run `npm install -g gulp bower`
* Start vagrant:
    * Run: `vagrant up --no-parallel`
* Run the spider:
    * Run: `./bin/spider`
* Attach to the docker container (if needed):
    * Run: `./bin/attach`
* Visit the site:
    * In your browser go to: `localhost:8080`
    * You may want to put a friendly name in your host machine's `/etc/hosts`
* Profit!

## Using the Spider ##

* Fetch all packages - `./bin/spider`
* Fetch only updated/missing packages - `./bin/spider update`
* Fetch departments/categories - `./bin/spider department`
* Fetch reviews - `./bin/spider review`
* Fetch reviews for a single package - `./bin/spider review com.example.pacakge.name`
* Fetch a single package - `./bin/spider com.example.pacakge.name`

## Deploying ##

uApp Explorer is setup to deploy to [Openshift](https://www.openshift.com/) via [Codeship](https://codeship.com/).
After code is pushed to the Github repo [Codeship](https://codeship.com/) runs the following to deploy:

~~~
#Switch to node v0.12.0
nvm install 0.12.0
nvm use 0.12.0

#Install dependencies
npm install

#Lint the code
gulp lint

#Deploy to the app server
git config --global user.email "$EMAIL"
git config --global user.name "$NAME"
echo yes | gulp deploy-app

#Deploy to the spider server
echo yes | gulp deploy-spider
~~~

With the following env vars:

* UAPPEXPLORER_APP_GIT - Git uri for the [Openshift](https://www.openshift.com/) deploy repo (app/api)
* UAPPEXPLORER_SPIDER_GIT - Git uri for the [Openshift](https://www.openshift.com/) deploy repo (spider)
* EMAIL- Git email, so git doesn't complain
* NAME - Git full name

## Infastructure ##

uApp Explorer is currently setup on 2 small [Openshift](https://www.openshift.com/) "gears"
(one for the app and api, another for the spider). Deployment is done via
[Codeship](https://codeship.com/). The mongo database is hosted on [Mongolab](https://mongolab.com/).
uApp Explorer uses the [Ubuntu Click api](https://wiki.ubuntu.com/AppStore/Interfaces/ClickPackageIndex)
to get app data and for parsing app packages. [Papertrail](https://papertrailapp.com/)
is used for logging and [Mailhide](http://www.google.com/recaptcha/mailhide/apikey)
is used to protect email addresses.

Checkout the stack on [Stackshare](http://stackshare.io/bhdouglass/uapp-explorer).

## Configuration ##

See `src/config.js` for more info about configuring uApp Explorer.

## Libraries ##

See `package.json`, `www/package.json` and `www/bower.json` for a list of third party dependencies. A big thank you to all those projects!

## Logo ##

The logo is derived from the compass icon from [FontAwesome](http://fontawesome.io/).

## License ##

Copyright (C) 2015 [Brian Douglass](http://bhdouglass.com/)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 3, as published
by the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranties of MERCHANTABILITY, SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
