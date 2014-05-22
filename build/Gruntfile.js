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
    }
  });

  grunt.loadNpmTasks('grunt-download-atom-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.task.registerTask('dev', ['copy:app', 'watch:dev']);
  grunt.task.registerTask('build', ['download-atom-shell', 'copy:app', 'watch:dev']);

};
