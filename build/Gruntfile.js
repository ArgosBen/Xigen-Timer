module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    "download-atom-shell": {
      version: "0.12.2",
      outputDir: "./XigenTimer",
      rebuild: true
    },
    "watch" : {
      "dev" : {
        files: [
          "../app/**",
          "../app/**/*",
          "../app/*"
        ],
        tasks: [
          "less",
          "copy:app"
        ]
      },
    },
    "copy" : {
      "app" : {
        "files" : [
          {expand: true, cwd: "../app" ,src: ['**'], dest: './XigenTimer/resources/app'}
        ]
      }
    },
    "less" : {
      "dist" : {
        "options" : {
          "paths" : ["../app/assets/less/core", "../app/assets/less/modules"],
          "sourceMap" : true,
          "sourceMapFilename": "assets/css/XigenTimer.css.map"
        },
        "files": {
          "../app/assets/css/XigenTimer.css": "../app/assets/less/XigenTimer.less"
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-download-atom-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.task.registerTask('dev', ['less', 'copy:app', 'watch:dev']);
  grunt.task.registerTask('build', ['download-atom-shell', 'copy:app', 'watch:dev']);

};
