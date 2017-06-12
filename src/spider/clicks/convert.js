'use strict';

const crypto = require('crypto');
const Mailhide = require('mailhide');
const sanitizeHtml = require('sanitize-html');

const config = require('../../config');

let mailhider = null;
if (config.mailhide.privateKey && config.mailhide.publicKey) {
    mailhider = new Mailhide(config.mailhide);
}

const categoryMap = {
    'Books': 'books-comics',
    'Books & Comics': 'books-comics',
    'Business': 'business',
    'Communication': 'communication',
    'Developer Tools': 'developer-tools',
    'Education': 'education',
    'Entertainment': 'entertainment',
    'Finance': 'finance',
    'Food & Drink': 'food-drink',
    'Games': 'games',
    'Graphics': 'Graphics',
    'Health & Fitness': 'health-fitness',
    'Media & Video': 'media-video',
    'Music & Audio': 'music-audio',
    'News & Magazines': 'news-magazines',
    'Personalisation': 'personalisation',
    'Productivity': 'productivity',
    'Reference': 'reference',
    'Science & Engineering': 'science-engineering',
    'Shopping': 'shopping',
    'Social Networking': 'social-networking',
    'Sports': 'sports',
    'Travel & Local': 'travel-local',
    'Utilities': 'accessories',
    'Weather': 'weather',
};

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
        click.categories = [
            categoryMap[category]
        ];
    },
    manifest: function(click, manifest) {
        click.framework = manifest.framework ? manifest.framework : '';
        click.desktop_file = {};
        click.scope_ini = {};
        click.permissions = [];

        if (manifest.hooks) {
            for (let app in manifest.hooks) {
                if (manifest.hooks[app].desktop) {
                    click.desktop_file[app] = manifest.hooks[app].desktop;
                }

                if (manifest.hooks[app].scope) {
                    click.scope_ini[app] = manifest.hooks[app].scope;
                }

                if (manifest.hooks[app].apparmor) {
                    if (manifest.hooks[app].apparmor.policy_groups) {
                        click.permissions = click.permissions.concat(manifest.hooks[app].apparmor.policy_groups);
                    }

                    if (manifest.hooks[app].apparmor.template == 'unconfined') {
                        click.permissions.push('unconfined');
                    }
                }
            }
        }

        click.permissions = click.permissions.filter(function(item, pos, self) {
            return self.indexOf(item) == pos; //Remove duplicates
        });

        //TODO features, url_dispatcher, webapp_inject, etc
    },
    architectures: 'architecture',
    keywords: 'keywords',
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
