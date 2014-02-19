module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodewebkit: {
      options: {
          build_dir: './webkitbuilds', // Where the build version of my node-webkit app is saved
          mac: false, // We want to build it for mac
          win: true, // We want to build it for win
          linux32: true, // We don't need linux32
          linux64: true // We don't need linux64
      },
      src: ['./package.json', './index.html', './node_modules/**/*', './assets/**/*'] // Your node-wekit app
    },
  });

  grunt.loadNpmTasks('grunt-node-webkit-builder');

  // Default task(s).
  grunt.registerTask('default', ['nodewebkit']);

};