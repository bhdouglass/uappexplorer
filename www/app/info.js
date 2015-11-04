module.exports = {
  count_types: {
    application: 'apps',
    scope: 'scopes',
    webapp: 'web apps',
    snappy: 'snappy apps',
    all: 'apps & scopes',
  },

  types: [
    {
      label: 'All Types',
      value: 'all',
    }, {
      label: 'Apps',
      value: 'application',
    }, {
      label: 'Web Apps',
      value: 'webapp',
    }, {
      label: 'Scopes',
      value: 'scope',
    }, {
      label: 'Snappy Apps',
      value: 'snappy',
    }
  ],

  architectures: [
    {
      label: 'Any',
      value: 'any',
    }, {
      label: 'All',
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
    }
  ],

  categories: [ //copied from the api, it doesn't change often, no need for an extra network request
    {
      internal_name: 'all',
      name: 'All Apps',
    }, {
      internal_name: 'books-comics',
      name: 'Books & Comics',
    }, {
      internal_name: 'business',
      name: 'Business',
    }, {
      internal_name: 'communication',
      name: 'Communication',
    }, {
      internal_name: 'developer-tools',
      name: 'Developer Tools',
    }, {
      internal_name: 'education',
      name: 'Education',
    }, {
      internal_name: 'entertainment',
      name: 'Entertainment',
    }, {
      internal_name: 'finance',
      name: 'Finance',
    }, {
      internal_name: 'food-drink',
      name: 'Food & Drink',
    }, {
      internal_name: 'games',
      name: 'Games',
    }, {
      internal_name: 'graphics',
      name: 'Graphics',
    }, {
      internal_name: 'health-fitness',
      name: 'Health & Fitness',
    }, {
      internal_name: 'lifestyle',
      name: 'Lifestyle',
    }, {
      internal_name: 'media-video',
      name: 'Media & Video',
    }, {
      internal_name: 'medical',
      name: 'Medical',
    }, {
      internal_name: 'music-audio',
      name: 'Music & Audio',
    }, {
      internal_name: 'news-magazines',
      name: 'News & Magazines',
    }, {
      internal_name: 'personalisation',
      name: 'Personalisation',
    }, {
      internal_name: 'productivity',
      name: 'Productivity',
    }, {
      internal_name: 'reference',
      name: 'Reference',
    }, {
      internal_name: 'science-engineering',
      name: 'Science & Engineering',
    }, {
      internal_name: 'shopping',
      name: 'Shopping',
    }, {
      internal_name: 'social-networking',
      name: 'Social Networking',
    }, {
      internal_name: 'sports',
      name: 'Sports',
    }, {
      internal_name: 'travel-local',
      name: 'Travel & Local',
    }, {
      internal_name: 'universal-accessaccessibility',
      name: 'Universal Accesss/Accessibility',
    }, {
      internal_name: 'accessories',
      name: 'Utilities',
    }, {
      internal_name: 'weather',
      name: 'Weather',
    }
  ],

  sorts: [
    {
      label: 'Most Relevant',
      value: 'relevance',
    }, {
      label: 'Title A-Z',
      value: 'title'
    }, {
      label: 'Title Z-A',
      value: '-title'
    }, {
      label: 'Newest',
      value: '-published_date'
    }, {
      label: 'Oldest',
      value: 'published_date'
    }, {
      label: 'Latest Update',
      value: '-last_updated'
    }, {
      label: 'Oldest Update',
      value: 'last_updated'
    }, {
      label: 'Highest Heart Rating',
      value: '-points'
    }, {
      label: 'Lowest Heart Rating',
      value: 'points'
    }, {
      label: 'Highest Star Rating',
      value: '-bayesian_average'
    }, {
      label: 'Lowest Star Rating',
      value: 'bayesian_average'
    }, {
      label: 'Most Popular (This Month)',
      value: '-monthly_popularity'
    }, {
      label: 'Least Popular (This Month)',
      value: 'monthly_popularity'
    }, {
      label: 'Free',
      value: 'prices.USD'
    }, {
      label: 'Most Expensive (USD)',
      value: '-prices.USD'
    },
  ],

  licenses: [
    {
      label: 'Any License',
      value: 'any',
    }, {
      label: 'Open Source',
      value: 'open_source'
    }, {
      label: 'Proprietary',
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
  ],
};
