module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodewebkit: {
      options: {
          version: '0.9.2',
          build_dir: './webkitbuilds', // Where the build version of my node-webkit app is saved
          mac: false, // We want to build it for mac
          win: true, // We want to build it for win
          linux32: false, // We don't need linux32
          linux64: false // We don't need linux64
      },
      src: ['./package.json', './index.html', './viewActivity.html', './node_modules/**/*', './assets/**/*'] // Your node-wekit app
    },
  });

  grunt.loadNpmTasks('grunt-node-webkit-builder');

  // Default task(s).
  grunt.registerTask('default', ['nodewebkit']);

};