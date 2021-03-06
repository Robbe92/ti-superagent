'use strict';

module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    clean: {
      "modules": [ 'test/fake-app/modules' ],
      "app": [ 'test/fake-app/build' ],
      "env": [ 'test/fake-app/Resources/env.js' ]
    },

    titaniumifier: {
      "module": {
        files: { '.' : '.' },
        options: {}
      }
    },

    titanium: {
      options: {
          command: 'build',
          logLevel: 'trace',
          projectDir: './test/fake-app',
          failure: /NOTOK/i,
          success: /ALLOK/i
      },
      "ios": {
        options: {
          platform: 'ios',
        }
      },
      "droid": {
        options: {
          platform: 'android',
          deviceId: grunt.option('device-id')
        }
      }
    },

    unzip: {
      "module": {
        src: 'superagent-commonjs-<%= pkg.version %>.zip',
        dest: 'test/fake-app'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-titaniumifier');
  grunt.loadNpmTasks('grunt-titanium');
  grunt.loadNpmTasks('grunt-zip');

  var server;

  grunt.registerTask('server:start', 'Starts the fake server', function () {
    if (!server) {
      server = require('./test/fake-server/server');
      grunt.log.oklns('Server startup');
    }
    else {
      grunt.log.oklns('Server already listening');
    }
  });

  grunt.registerTask('server:stop', 'Starts the fake server', function () {
    if (!server) {
      grunt.log.oklns('No server to stop');
    }
    else {
      server.unref();
      server.close();
      grunt.log.oklns('Server stopped correctly');
    }
  });

  grunt.registerTask('env', 'Builds env.js file from the current process.', function () {
    grunt.file.write('test/fake-app/Resources/env.js', 'module.exports = ' + JSON.stringify(process.env, null, 2) + ';');
  });

  grunt.registerTask('build', [ 'titaniumifier:module' ]);
  grunt.registerTask('test:ios', [ 'unzip:module', 'env', 'titanium:ios' ]);
  grunt.registerTask('test:droid', [ 'unzip:module', 'env', 'titanium:droid' ]);

  grunt.registerTask('ios', [ 'clean', 'build', 'test:ios' ]);
  grunt.registerTask('droid', [ 'clean', 'build', 'test:droid' ]);

  grunt.registerTask('default', [ 'ios' ]);
};
