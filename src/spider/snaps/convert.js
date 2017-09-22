'use strict';

const crypto = require('crypto');
const Mailhide = require('mailhide');
const sanitizeHtml = require('sanitize-html');

const utils = require('../../utils');
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

//ubuntu api property: internal snap property or transform function
let propertyMap = {
    developer_name: 'author',
    architecture: 'architecture',
    sections: 'categories',
    company_name: 'company',
    changelog: function(snap, changelog) {
        snap.changelog = sanitize(changelog);
    },
    description: function(snap, description) {
        snap.description = sanitize(description);

        let split = snap.description.split('\n');
        if (split.length > 2 && split[0] == split[1]) { //Remove duplicated second line
            split.shift(); //Remove duplicate first line
            snap.description = split.join('\n');
        }

        if (snap.description && split.length > 0) {
            let tagline = split[0];
            if (tagline == snap.title) {
                tagline = '';

                if (split.length > 1) {
                    tagline = split[1];

                    if (tagline.length > 50) {
                        let pos = tagline.substring(0, 50).lastIndexOf(' ');
                        if (pos > -1) {
                            tagline = tagline.substring(0, pos) + '...';
                        }
                        else {
                            tagline = tagline.substring(0, 50) + '...';
                        }
                    }
                }
            }

            snap.tagline = tagline;
        }
        else {
            snap.tagline = '';
        }
    },
    binary_filesize: function(snap, binary_filesize) {
        snap.filesize = utils.niceBytes(binary_filesize);
    },
    icon_url: function (snap, icon) {
        snap.icon = icon;
        snap.icon_hash = crypto.createHash('md5').update(snap.icon).digest('hex');
        snap.icon_filename = snap.icon.replace('https://', '').replace('http://', '').replace(/\//g, '-');
    },
    keywords: 'keywords',
    last_updated: 'last_updated',
    license: 'license',
    package_name: function(snap, package_name) {
        snap.package_name = package_name;
        snap.name = package_name;
    },
    prices: 'prices',
    date_published: 'published_date',
    screenshot_urls: 'screenshots',
    contact: function(snap, contact) {
        if (contact.indexOf('mailto:') === 0 && mailhider) {
            snap.support = mailhider.url(contact.replace('mailto:', ''));
        }
        else {
            snap.support = contact;
        }
    },
    terms_of_service: 'terms',
    title: 'title',
    package_id: 'ubuntu_id',
    version: 'version',
    website: 'website',
    content: 'type',
    confinement: 'confinement',
    release: 'release',
    downloads: 'downloads',
};

function convert(data) {
    let snap = {};

    for (let dataProperty in propertyMap) {
        if (data[dataProperty]) {
            if (typeof(propertyMap[dataProperty]) == 'function') {
                propertyMap[dataProperty](snap, data[dataProperty]);
            }
            else {
                snap[propertyMap[dataProperty]] = data[dataProperty];
            }
        }
    }

    if (data._links && data._links.self && data._links.self.href) {
        snap.url = data._links.self.href;
    }

    return snap;
}

module.exports = convert;
