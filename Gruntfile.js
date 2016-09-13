module.exports = function(grunt, settingsKey) {
  var tasks = grunt.cli ? grunt.cli.tasks : [],
      mainTask = tasks.length ? tasks[0] : 'default'; 
  settingsKey = settingsKey||((mainTask=='default') ?  'prod' : 'local');
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
		    files: ['node_modules/mongoose/lib/browser.js', 'settings/local.js', 'apps/demo.js'],
            tasks: ['browserify:calcute']
        },
        gruntfile: {
            files: ['Gruntfile.js'],
            tasks: [mainTask]
        }
    },
    browserify: {
        calcute: {
            files: {
                'build/demo/app.js': ['apps/demo.js']
            },
            options: {
                alias: {
                    'mongoose': './node_modules/mongoose/lib/browser.js',
                    'mongoose-id-validator': './node_modules/mongoose-id-validator/lib/id-validator.js',
                    'settings': './settings/' + settingsKey + '.js'
                }
            }
       }
    },
    uglify: {
        vendorminjs: {
            options: {
                'report': 'min',
                'mangle': false,
                'sourceMap': true
            },
            files: {
                'build/vendor.min.js': ['build/vendor/angular/js/angular.js', 'build/vendor/angular/js/angular-*.js']
            }
        },
        calcuteminjs: {
            options: {
                'report': 'min',
                'mangle': false,
                'sourceMap': true
            },
            files: {
                'build/demo/app.min.js': ['build/demo/app.js']
            }
        }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('local', ['copy', 'sass', 'browserify']);
  grunt.registerTask('default', ['copy', 'sass', 'browserify', 'uglify']);
};
