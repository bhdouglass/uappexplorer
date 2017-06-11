'use strict';

const crypto = require('crypto');
const Mailhide = require('mailhide');
const sanitizeHtml = require('sanitize-html');

const config = require('../../config');

let mailhider = null;
if (config.mailhide.privateKey && config.mailhide.publicKey) {
    mailhider = new Mailhide(config.mailhide);
}

function sanitize(html) {
    return sanitizeHtml(html, {
        allowedTags: [],
        allowedAttributes: [],
    }).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\r/g, '');
}

//openstore api property: internal click property or transform function
let propertyMap = {
    id: function(click, id) {
        click.name = id;
        click.url = 'https://open.uappexplorer.com/app/' + id;
    },
    name: 'title',
    author: 'author',
    support_url: 'support',
    types: function(click, types) {
        click.types = types.map((type) => {
            if (type == 'app') {
                type = 'application';
            }
            else if (type == 'webapp+') {
                type = 'webapp';
            }

            return type;
        });
    },
    version: 'version',
    tagline: 'tagline',
    description: function(click, description) {
        click.description = sanitize(description);
    },
    changelog: function(click, changelog) {
        click.changelog = sanitize(changelog);
    },
    license: 'license',
    category: function(click, category) {
        click.categories = [category]; //TODO normalize this
    },
    manifest: function(click, manifest) {
        //TODO features, framework, scope_ini, desktop_file, url_dispatcher, webapp_inject, etc
    },
    architectures: 'architecture',
    keywords: 'keywords',
    permissions: 'permissions',
    download: 'download',
    filesize: 'filesize',
    icon: function(click, icon) {
        click.icon = icon;
        click.icon_hash = crypto.createHash('md5').update(click.icon).digest('hex');
        click.icon_filename = click.icon.replace('https://', '').replace('http://', '').replace(/\//g, '-');
    },
    screenshots: 'screenshots',
    published_date: 'published_date',
    updated_date: 'last_updated',
};

function convert(data) {
    let click = {
        store: 'openstore',
    };

    for (let dataProperty in propertyMap) {
        if (data[dataProperty]) {
            if (typeof(propertyMap[dataProperty]) == 'function') {
                propertyMap[dataProperty](click, data[dataProperty]);
            }
            else {
                click[propertyMap[dataProperty]] = data[dataProperty];
            }
        }
    }

    return click;
}

module.exports = convert;
