var i18n = require('i18next-client');

module.exports = {
  count_types: function(count) {
    return {
      all_types: i18n.t('apps', {count: count}),
      all: i18n.t('phone apps & scopes'),
      application: i18n.t('apps', {count: count}),
      scope: i18n.t('scopes', {count: count}),
      webapp: i18n.t('web apps', {count: count}),
    };
  },

  snap_count_types: function(count) {
    return {
      all_types: i18n.t('snaps', {count: count}),
      all: i18n.t('snaps'),
      oem: i18n.t('oem snaps'),
      os: i18n.t('os snaps'),
      kernel: i18n.t('kernel snaps'),
      gadget: i18n.t('gadget snaps'),
      framework: i18n.t('framework snaps'),
      application: i18n.t('app snaps'),
    };
  },

  types: function() {
    return [
      {
        label: i18n.t('All Types'),
        value: 'all',
      }, {
        label: i18n.t('Apps'),
        value: 'application',
      }, {
        label: i18n.t('Web Apps'),
        value: 'webapp',
      }, {
        label: i18n.t('Scopes'),
        value: 'scope',
      },
    ];
  },

  snap_types: function() {
    return [
      {
        label: i18n.t('All Snaps'),
        value: 'all',
      }, {
        label: i18n.t('App Snaps'),
        value: 'application',
      }, {
        label: i18n.t('Framework Snaps'),
        value: 'framework',
      }, {
        label: i18n.t('OEM Snaps'),
        value: 'oem',
      }, {
        label: i18n.t('OS Snaps'),
        value: 'os',
      }, {
        label: i18n.t('Kernel Snaps'),
        value: 'kernel',
      }, {
        label: i18n.t('Gadget Snaps'),
        value: 'gadget',
      },
    ];
  },

  snap_confinement: function() {
    return [
      {
        label: i18n.t('Any Confinement'),
        value: 'any',
      }, {
        label: i18n.t('Strict'),
        value: 'strict',
      }, {
        label: i18n.t('Dev Mode'),
        value: 'devmode',
      }, {
        label: i18n.t('Classic'),
        value: 'classic',
      }
    ];
  },

  architectures: function() {
    return [
      {
        label: i18n.t('Any Architecture'),
        value: 'any',
      }, {
        label: i18n.t('All Architectures'),
        value: 'all',
      }, {
        label: 'armhf',
        value: 'armhf',
      }, {
        label: 'i386',
        value: 'i386',
      }, {
        label: 'x86_64',
        value: 'x86_64',
      }, {
        label: 'arm64',
        value: 'arm64',
      }, {
        label: 'ppc64el',
        value: 'ppc64el',
      }, {
        label: 's390x',
        value: 's390x',
      }
    ];
  },

  categories: function() {
    return [ //copied from the api, it doesn't change often, no need for an extra network request
      {
        internal_name: 'all',
        name: i18n.t('All Categories'),
      }, {
        internal_name: 'books-comics',
        name: i18n.t('Books & Comics'),
      }, {
        internal_name: 'business',
        name: i18n.t('Business'),
      }, {
        internal_name: 'communication',
        name: i18n.t('Communication'),
      }, {
        internal_name: 'developer-tools',
        name: i18n.t('Developer Tools'),
      }, {
        internal_name: 'education',
        name: i18n.t('Education'),
      }, {
        internal_name: 'entertainment',
        name: i18n.t('Entertainment'),
      }, {
        internal_name: 'finance',
        name: i18n.t('Finance'),
      }, {
        internal_name: 'food-drink',
        name: i18n.t('Food & Drink'),
      }, {
        internal_name: 'games',
        name: i18n.t('Games'),
      }, {
        internal_name: 'graphics',
        name: i18n.t('Graphics'),
      }, {
        internal_name: 'health-fitness',
        name: i18n.t('Health & Fitness'),
      }, {
        internal_name: 'lifestyle',
        name: i18n.t('Lifestyle'),
      }, {
        internal_name: 'media-video',
        name: i18n.t('Media & Video'),
      }, {
        internal_name: 'medical',
        name: i18n.t('Medical'),
      }, {
        internal_name: 'music-audio',
        name: i18n.t('Music & Audio'),
      }, {
        internal_name: 'news-magazines',
        name: i18n.t('News & Magazines'),
      }, {
        internal_name: 'personalisation',
        name: i18n.t('Personalisation'),
      }, {
        internal_name: 'productivity',
        name: i18n.t('Productivity'),
      }, {
        internal_name: 'reference',
        name: i18n.t('Reference'),
      }, {
        internal_name: 'science-engineering',
        name: i18n.t('Science & Engineering'),
      }, {
        internal_name: 'shopping',
        name: i18n.t('Shopping'),
      }, {
        internal_name: 'social-networking',
        name: i18n.t('Social Networking'),
      }, {
        internal_name: 'sports',
        name: i18n.t('Sports'),
      }, {
        internal_name: 'travel-local',
        name: i18n.t('Travel & Local'),
      }, {
        internal_name: 'universal-accessaccessibility',
        name: i18n.t('Universal Access/Accessibility'),
      }, {
        internal_name: 'accessories',
        name: i18n.t('Utilities'),
      }, {
        internal_name: 'weather',
        name: i18n.t('Weather'),
      }
    ];
  },

  snap_categories: function() {
    return [
      {
        internal_name: 'all',
        name: i18n.t('All Categories'),
      }, {
        internal_name: 'developers',
        name: i18n.t('Developers'),
      }, {
        internal_name: 'finance',
        name: i18n.t('Finance'),
      }, {
        internal_name: 'games',
        name: i18n.t('Games'),
      }, {
        internal_name: 'graphics',
        name: i18n.t('Graphics'),
      }, {
        internal_name: 'music',
        name: i18n.t('Music'),
      }, {
        internal_name: 'productivity',
        name: i18n.t('Productivity'),
      }, {
        internal_name: 'social-networking',
        name: i18n.t('Social Networking'),
      }, {
        internal_name: 'utilities',
        name: i18n.t('Utilities'),
      }, {
        internal_name: 'video',
        name: i18n.t('Video'),
      }
    ];
  },

  sorts: function() {
    return [
      {
        label: i18n.t('Most Relevant'),
        value: 'relevance',
      }, {
        label: i18n.t('Title A-Z'),
        value: 'title'
      }, {
        label: i18n.t('Title Z-A'),
        value: '-title'
      }, {
        label: i18n.t('Newest'),
        value: '-published_date'
      }, {
        label: i18n.t('Oldest'),
        value: 'published_date'
      }, {
        label: i18n.t('Latest Update'),
        value: '-last_updated'
      }, {
        label: i18n.t('Oldest Update'),
        value: 'last_updated'
      }, {
        label: i18n.t('Highest Heart Rating'),
        value: '-points'
      }, {
        label: i18n.t('Lowest Heart Rating'),
        value: 'points'
      }, {
        label: i18n.t('Highest Star Rating'),
        value: '-bayesian_average'
      }, {
        label: i18n.t('Lowest Star Rating'),
        value: 'bayesian_average'
      }, {
        label: i18n.t('Most Popular (This Month)'),
        value: '-monthly_popularity'
      }, {
        label: i18n.t('Least Popular (This Month)'),
        value: 'monthly_popularity'
      }, {
        label: i18n.t('Free'),
        value: 'prices.USD'
      }, {
        label: i18n.t('Most Expensive (USD)'),
        value: '-prices.USD'
      },
    ];
  },

  snap_sorts: function() {
    return [
      {
        label: i18n.t('Most Relevant'),
        value: 'relevance',
      }, {
        label: i18n.t('Title A-Z'),
        value: 'title'
      }, {
        label: i18n.t('Title Z-A'),
        value: '-title'
      }, {
        label: i18n.t('Newest'),
        value: '-published_date'
      }, {
        label: i18n.t('Oldest'),
        value: 'published_date'
      }, {
        label: i18n.t('Latest Update'),
        value: '-last_updated'
      }, {
        label: i18n.t('Oldest Update'),
        value: 'last_updated'
      },
    ];
  },

  licenses: function() {
    return [
      {
        label: i18n.t('Any License'),
        value: 'any',
      }, {
        label: i18n.t('Open Source'),
        value: 'open_source'
      }, {
        label: i18n.t('Proprietary'),
        value: 'proprietary'
      }, {
        label: 'Apache License',
        value: 'apache_license'
      }, {
        label: 'BSD License (Simplified)',
        value: 'bsd_license_(simplified)'
      }, {
        label: 'Creative Commons - No Rights Reserved',
        value: 'creative_commons_-_no_rights_reserved'
      }, {
        label: 'GNU Affero GPL v3',
        value: 'gnu_affero_gpl_v3'
      }, {
        label: 'GNU GPL v2',
        value: 'gnu_gpl_v2'
      }, {
        label: 'GNU GPL v3',
        value: 'gnu_gpl_v3'
      }, {
        label: 'GNU LGPL v2.1',
        value: 'gnu_lgpl_v2.1'
      }, {
        label: 'GNU LGPL v3',
        value: 'gnu_lgpl_v3'
      }, {
        label: 'MIT/X/Expat License',
        value: 'mit_x_expat_license'
      }, {
        label: 'Academic Free License',
        value: 'academic_free_license'
      }, {
        label: 'Artistic License 1.0',
        value: 'artistic_license_1.0'
      }, {
        label: 'Artistic License 2.0',
        value: 'artistic_license_2.0'
      }, {
        label: 'Common Public License',
        value: 'common_public_license'
      }, {
        label: 'Creative Commons - Attribution',
        value: 'creative_commons_-_attribution'
      }, {
        label: 'Creative Commons - Attribution Share Alike',
        value: 'creative_commons_-_attribution_share_alike'
      }, {
        label: 'Eclipse Public License',
        value: 'eclipse_public_license'
      }, {
        label: 'Educational Community License',
        value: 'educational_community_license'
      }, {
        label: 'Mozilla Public License',
        value: 'mozilla_public_license'
      }, {
        label: 'Open Font License v1.1',
        value: 'open_font_license_v1.1'
      }, {
        label: 'Open Software License v3.0',
        value: 'open_software_license_v3.0'
      }, {
        label: 'PHP License',
        value: 'php_license'
      }, {
        label: 'Public Domain',
        value: 'public_domain'
      }, {
        label: 'Python License',
        value: 'python_license'
      }, {
        label: 'Zope Public License',
        value: 'zope_public_license'
      }, {
        label: 'Other Open Source',
        value: 'other_open_source'
      }
    ];
  },

  languages: [
    {
      'name': 'Arabic',
      'code': 'ar',
      'untranslated': 54,
    }, {
      'name': 'Asturian',
      'code': 'ast',
      'untranslated': 236,
    }, {
      'name': 'Basque',
      'code': 'eu',
      'untranslated': 48,
    }, {
      'name': 'Brazilian Portuguese',
      'code': 'pt_BR',
      'untranslated': 45,
    }, {
      'name': 'Burmese',
      'code': 'my',
      'untranslated': 251,
    }, {
      'name': 'Catalan',
      'code': 'ca',
      'untranslated': 21,
    }, {
      'name': 'Chinese (Simplified)',
      'code': 'zh_CN',
      'untranslated': 32,
    }, {
      'name': 'Chinese (Traditional)',
      'code': 'zh_TW',
      'untranslated': 180,
    }, {
      'name': 'Croatian',
      'code': 'hr',
      'untranslated': 238,
    }, {
      'name': 'Czech',
      'code': 'cs',
      'untranslated': 53,
    }, {
      'name': 'Danish',
      'code': 'da',
      'untranslated': 245,
    }, {
      'name': 'Dutch',
      'code': 'nl',
      'untranslated': 2,
    }, {
      'name': 'English (UK)',
      'code': 'en_GB',
      'untranslated': 53,
    }, {
      'name': 'French',
      'code': 'fr',
      'untranslated': 20,
    }, {
      'name': 'Galician',
      'code': 'gl',
      'untranslated': 20,
    }, {
      'name': 'German',
      'code': 'de',
      'untranslated': 0,
    }, {
      'name': 'Greek',
      'code': 'el',
      'untranslated': 0,
    }, {
      'name': 'Hungarian',
      'code': 'hu',
      'untranslated': 20,
    }, {
      'name': 'Italian',
      'code': 'it',
      'untranslated': 27,
    }, {
      'name': 'Maylay',
      'code': 'ms',
      'untranslated': 260,
    }, {
      'name': 'Norwegian Bokmal',
      'code': 'nb',
      'untranslated': 150,
    }, {
      'name': 'Persian',
      'code': 'fa',
      'untranslated': 267,
    }, {
      'name': 'Polish',
      'code': 'pl',
      'untranslated': 59,
    }, {
      'name': 'Portuguese',
      'code': 'pt',
      'untranslated': 36,
    }, {
      'name': 'Romanian',
      'code': 'ro',
      'untranslated': 103,
    }, {
      'name': 'Russian',
      'code': 'ru',
      'untranslated': 42,
    }, {
      'name': 'Serbian',
      'code': 'sr',
      'untranslated': 53,
    }, {
      'name': 'Spanish',
      'code': 'es',
      'untranslated': 1,
    }, {
      'name': 'Swedish',
      'code': 'sv',
      'untranslated': 202,
    }, {
      'name': 'Turkish',
      'code': 'tr',
      'untranslated': 224,
    }, {
      'name': 'Uyghur',
      'code': 'ug',
      'untranslated': 64,
    },
  ],
};
