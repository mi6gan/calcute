module.exports = function(grunt, settings) {
  var tasks = grunt.cli ? grunt.cli.tasks : [];
  try {
    settings = settings || require('./settings/index.js');
  } catch(e) {
    settings = {
        DEBUG: true,
        name: 'local'
    };
  }
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      options: {
          sourceMap: true,
          includePaths: ['node_modules/bootstrap-sass/assets/stylesheets']
      },
      base: {
        src: 'assets/calcute/scss/base.scss',
        dest: 'build/calcute/css/base.css'
      },
      bootstrap: {
        src: 'assets/calcute/scss/bootstrap.scss',
        dest: 'build/calcute/vendor/bootstrap/css/base.css'
      }
    },
    cssmin: {
        calcute: {
            files: {
                'build/calcute/css/bundle.min.css': [
                    'build/calcute/vendor/bootstrap/css/base.css',
                    'build/calcute/css/base.css'
                ]
            }
        }
    },
    copy: {
    images: {
		files: [
            {expand: true,
            cwd: 'assets/calcute/images/',
            src: ['*.{png,jpg}'], dest: 'build/calcute/images'}
        ]
    },
    icons: {
		files: [
            {expand: true,
            cwd: 'assets/calcute/icons/',
            src: ['*.{png,jpg}'], dest: 'build/calcute/icons'}
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
                dest: 'build/calcute/fonts/'
            }]
      },
    },
    watch: {
        sass: {
            files: ['assets/**/scss/**'],
            tasks: ['sass:base', 'sass:bootstrap', 'cssmin:calcute']
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
		    files: ['assets/**/js/**', 'settings/' + settings.name + '.js', 'apps/calcute.js', 'lib/**/*.js'],
		    tasks: settings.DEBUG ? ['browserify:calcute'] : ['browserify:calcute', 'uglify:calcuteminjs'] 
        },
        gruntfile: {
            files: ['Gruntfile.js'],
            tasks: ['default']
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
                'build/calcute/js/app.js': ['apps/calcute.js']
            },
            options: {
                alias: {
                    'settings': './settings/apps/' + settings.name + '.js',
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
                'mangle': false,
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
                'build/calcute/js/app.min.js': ['build/calcute/js/app.js']
            }
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  if(settings.DEBUG){
    grunt.registerTask('default', ['copy', 'sass', 'browserify']);
  }
  else {
    grunt.registerTask('default', ['copy', 'sass', 'cssmin', 'browserify', 'uglify']);
  }
};
