module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'src/server/static/dist/app/app.min.js': ['src/server/static/dist/app/app.js']
        }
      }
    },

    jshint: {
      front: {
        options: {
          node: true,
          browser: true,
          esnext: true,
          curly: true,
          immed: true,
          indent: 2,
          latedef: true,
          newcap: true,
          noarg: true,
          quotmark: 'single',
          undef: true,
          unused: true,
          strict: false,
          globalstrict: true,
          trailing: true,
          smarttabs: true,
          devel: true,
          bitwise: false,
          globals: {
            angular: false,
            '_': false,
            '$': false
          }
        },
        files: {
          src: ['src/server/static/app/*.js', 'src/server/static/app/*/*.js']
        }
      },
      back: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: {
          src: ['src/*.js', 'src/*/*.js', 'Gruntfile.js']
        }
      }
    },

    copy: {
      dist: {
        files: [
          {
            flatten: true,
            src: ['src/server/static/app/partials/*.html'],
            dest: 'src/server/static/dist/app/partials/',
            filter: 'isFile',
            expand: true,
          },
          {
            flatten: true,
            src: ['src/server/static/*.html'],
            dest: 'src/server/static/dist/',
            filter: 'isFile',
            expand: true,
          },
          {
            flatten: true,
            src: ['src/server/static/img/*'],
            dest: 'src/server/static/dist/img',
            filter: 'isFile',
            expand: true,
          },
        ],
      },
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: 'src/server/static/dist',
          src: '**/*.html',
          dest: 'src/server/static/dist'
        }]
      }
    },

    cssmin: {
      dis: {
        files: {
          'src/server/static/dist/css/main.min.css': ['src/server/static/css/main.css']
        }
      }
    },

    targethtml: {
      dist: {
        options: {
          curlyTags: {
            version: '<%= grunt.template.today("yyyymmddHHMMss") %>',
          }
        },
        files: {
          'src/server/static/dist/index.html': 'src/server/static/dist/index.html',
          'src/server/static/dist/404.html': 'src/server/static/dist/404.html',
        }
      }
    },

    ngAnnotate: {
      options: {
        singleQuotes: true,
      },
      dist: {
        files: {
          'src/server/static/dist/app/app.js': ['src/server/static/app/app.js', 'src/server/static/app/*/*.js']
        }
      }
    },

    clean: ['src/server/static/dist'],

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-targethtml');
  grunt.loadNpmTasks('grunt-ng-annotate');

  grunt.registerTask('test', ['jshint:front', 'jshint:back']);

  grunt.registerTask('build', ['jshint:front', 'jshint:back', 'clean', 'ngAnnotate', 'uglify', 'copy', 'targethtml', 'htmlmin', 'cssmin']);

};
