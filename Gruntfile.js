module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      options: {
          sourceMap: true,
          includePaths: ['node_modules/bootstrap-sass/assets/stylesheets']
      },
      base: {
        src: 'static/src/scss/base.scss',
        dest: 'static/build/calcute/css/base.css'
      },
      bootstrap: {
        src: 'static/src/scss/bootstrap.scss',
        dest: 'static/build/vendor/bootstrap/css/base.css'
      }
    },
    copy: {
    images: {
		files: [
            {expand: true,
            cwd: 'static/src/images/',
            src: ['*.{png,jpg}'], dest: 'static/build/images'}
        ]
    },
    icons: {
		files: [
            {expand: true,
            cwd: 'static/src/icons/',
            src: ['*.{png,jpg}'], dest: 'static/build/calcute/icons'}
        ]
    },
    js: {
        files: [{
            expand: true,
            cwd: 'static/src/js',
            src: ['**'], dest: 'static/build/calcute/js'}]
    },
    angularjs: {
		files: [{
            expand: true,
            cwd: 'node_modules/angular',
            src: ['angular.js',], dest: 'static/build/vendor/angular/js'}]
    },
    angularmessages: {
		files: [{
            expand: true,
            cwd: 'node_modules/angular-messages',
            src: ['angular-messages.js',], dest: 'static/build/vendor/angular/js'}]
    },
    angularanimatejs: {
		files: [{
            expand: true,
            cwd: 'node_modules/angular-animate',
            src: ['angular-animate.js',], dest: 'static/build/vendor/angular/js'}]
    },
    angularresourcejs: {
		files: [{
            expand: true,
            cwd: 'node_modules/angular-resource',
            src: ['angular-resource.js',], dest: 'static/build/vendor/angular/js'}]
    },
    angularroutejs: {
		files: [{
            expand: true,
            cwd: 'node_modules/angular-route',
            src: ['angular-route.js',], dest: 'static/build/vendor/angular/js'}]
    },
    angularmasksjs: {
        files: [{
            src: 'static/src/vendor/ngMask/ngMask.js', 
            dest: 'static/build/vendor/angular/js/angular-mask.js'
        }]
    },
    bootstrapjs: {
        files: [{
            expand: true,
            cwd: 'node_modules/bootstrap-sass/javascripts/bootstrap',
            src: ['button.js'],
            dest: 'static/build/vendor/js/bootstrap'}]
      },
    fonts: {
		files: [{
                expand: true,
                cwd: 'node_modules/font-awesome/fonts/',
                src: ['*.{otf,eot,svg,ttf,woff,woff2}'],
                dest: 'static/build/calcute/fonts/'
            }]
      },
    },
    watch: {
        sass: {
            files: ['static/src/scss/**'],
            tasks: ['sass:base', 'sass:bootstrap']
        },
    	fonts: {
		    files: ['static/src/fonts/**'],
		    tasks: ['copy:fonts']
	    },
    	images: {
		    files: ['static/src/images/**'],
		    tasks: ['copy:images']
	    },
    	icons: {
		    files: ['static/src/icons/**'],
		    tasks: ['copy:icons']
	    },
    	js: {
		    files: ['static/src/js/**'],
		    tasks: ['copy:js']
	    },
    },
    uglify: {
        vendorminjs: {
            options: {
                'report': 'min',
                'mangle': false,
                'sourceMap': true
            },
            files: {
                'static/build/vendor.min.js': ['static/build/vendor/angular/js/angular.js', 'static/build/vendor/angular/js/angular-*.js']
            }
        },
        calcuteminjs: {
            options: {
                'report': 'min',
                'mangle': false,
                'sourceMap': true
            },
            files: {
                'static/build/calcute.min.js': ['server/angoose-client-generated.js', 'static/build/calcute/**/*.js']
            }
        }
    },
    browserify: {
        angularmasker: {
            files: {
                'static/build/vendor/angular/js/angular-masker.js': ['node_modules/angular-masker/src/angular-masker.js']
            }
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['copy', 'sass', 'browserify']);
  grunt.registerTask('prod', ['copy', 'sass', 'browserify', 'uglify']);

};
