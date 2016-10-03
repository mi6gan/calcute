module.exports = function(grunt, settingsKey) {
  var tasks = grunt.cli ? grunt.cli.tasks : [],
    mainTask = tasks.length ? tasks[0] : 'default', 
    settingsKey = settingsKey||((mainTask=='default') ?  'local' : 'local'),
    settings = require('./settings')[settingsKey];
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      options: {
          sourceMap: true,
          includePaths: ['node_modules/bootstrap-sass/assets/stylesheets']
      },
      base: {
        src: 'assets/demo/scss/base.scss',
        dest: 'build/demo/css/base.css'
      },
      bootstrap: {
        src: 'assets/demo/scss/bootstrap.scss',
        dest: 'build/demo/vendor/bootstrap/css/base.css'
      }
    },
    copy: {
    images: {
		files: [
            {expand: true,
            cwd: 'assets/demo/images/',
            src: ['*.{png,jpg}'], dest: 'build/demo/images'}
        ]
    },
    icons: {
		files: [
            {expand: true,
            cwd: 'assets/demo/icons/',
            src: ['*.{png,jpg}'], dest: 'build/demo/icons'}
        ]
    },
    bootstrapjs: {
        files: [{
            expand: true,
            cwd: 'node_modules/bootstrap-sass/javascripts/bootstrap',
            src: ['button.js'],
            dest: 'build/vendor/bootstrap/js'}]
      },
    fonts: {
		files: [{
                expand: true,
                cwd: 'node_modules/font-awesome/fonts/',
                src: ['*.{otf,eot,svg,ttf,woff,woff2}'],
                dest: 'build/demo/fonts/'
            }]
      },
    },
    watch: {
        sass: {
            files: ['assets/**/scss/**'],
            tasks: ['sass:base', 'sass:bootstrap']
        },
    	fonts: {
		    files: ['assets/**/fonts/**'],
		    tasks: ['copy:fonts']
	    },
    	images: {
		    files: ['assets/**/images/**'],
		    tasks: ['copy:images']
	    },
    	icons: {
		    files: ['assets/**/icons/**'],
		    tasks: ['copy:icons']
	    },
    	js: {
		    files: ['assets/**/js/**'],
		    tasks: ['copy:js']
	    },
        browserifycalcute: {
		    files: ['settings/' + settingsKey + '.js', 'apps/demo.js', 'lib/**/*.js'],
            tasks: ['browserify:calcute']
        },
        gruntfile: {
            files: ['Gruntfile.js'],
            tasks: [mainTask]
        }
    },
    browserify: {
        mongoose: {
            files: {
                'build/vendor/js/mongoose.bundle.js': [
                    'mongoose',
                    'mongoose-id-validator'
                ],
            },
            options: {
                alias: {
                    'mongoose': './node_modules/mongoose/lib/browser.js',
                    'mognoose-id-validator': './node_modules/mongoose-id-validator/index.js'
                },
                browserifyOptions: {
                    debug: settings.DEBUG
                }
            }
        },
        angular: {
            files: {
                'build/vendor/js/angular.bundle.js': [
                    'angular',
                    'angular-messages',
                    'angular-resource',
                    'angular-route',
                    'angular-animate'
                ],
            },
            options: {
                alias: {
                    'angular': './node_modules/angular/index.js',
                    'angular-messages': './node_modules/angular-messages/index.js',
                    'angular-resource': './node_modules/angular-resource/index.js',
                    'angular-route': './node_modules/angular-route/index.js',
                    'angular-animate': './node_modules/angular-animate/index.js'
                },
                browserifyOptions: {
                    debug: settings.DEBUG
                }
            }
        },
        calcute: {
            files: {
                'build/demo/js/app.js': ['apps/demo.js']
            },
            options: {
                alias: {
                    'settings': './settings/' + settingsKey + '.js',
                },
                external: [
                    'mongoose', 
                    'mongoose-id-validator',
                    'angular',
                    'angular-messages',
                    'angular-resource',
                    'angular-route',
                    'angular-animate'
                ],
                browserifyOptions: {
                    debug: settings.DEBUG
                },
                transform: (settings.DEBUG ? [] : [
                    ['babelify', {presets: 'latest'}]
                ])
            }
       }
    },
    uglify: {
        mongooseminjs: {
            options: {
                'report': 'min',
                'sourceMap': settings.DEBUG
            },
            files: {
                'build/vendor/js/mongoose.min.js': ['build/vendor/js/mongoose.bundle.js']
            }
        },
        angularminjs: {
            options: {
                'report': 'min',
                'mangle': false,
                'sourceMap': settings.DEBUG
            },
            files: {
                'build/vendor/js/angular.min.js': ['build/vendor/js/angular.bundle.js']
            },
        },
        calcuteminjs: {
            options: {
                'report': 'min',
                'mangle': false,
                'sourceMap': settings.DEBUG
            },
            files: {
                'build/demo/js/app.min.js': ['build/demo/js/app.js']
            }
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('local', ['copy', 'sass', 'browserify']);
  grunt.registerTask('production', ['copy', 'sass', 'browserify', 'uglify']);
  grunt.registerTask('stage', ['copy', 'sass', 'browserify']);
  grunt.registerTask('default', ['copy', 'sass', 'browserify', 'uglify']);
};
