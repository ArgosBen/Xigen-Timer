(function () {

	"use strict";

	var grunt = require('grunt'),
		pkgName = grunt.file.readJSON('package.json').name,
		isWin = grunt.file.isDir('webkitbuilds/releases/' + pkgName + '/win/'),
		isMac =  grunt.file.isDir('webkitbuilds/releases/' + pkgName + '/mac/'),
		isLinux = grunt.file.isDir('webkitbuilds/releases/' + pkgName + '/linux32/'),
		release = grunt.file.readJSON('package.json').version;

	module.exports = {};

	if (isWin) {
		module.exports.win = {
			cwd: 'webkitbuilds/releases/' + pkgName + '/win/' + pkgName + '/',
			src: [
				'webkitbuilds/releases/' + pkgName + '/win/' + pkgName + '/**',
			],
			dest: 'webkitbuilds/archives/XigenTimer_win_' + release + '.zip'
		};
	}

	if (isMac) {
		module.exports.mac = {
			cwd: 'webkitbuilds/releases/' + pkgName + '/mac/' + pkgName + '/',
			src: [
				'webkitbuilds/releases/' + pkgName + '/mac/' + pkgName + '.app/**/*',
			],
			dest: 'webkitbuilds/archives/XigenTimer_osx_' + release + '.zip'
		};
	}

	if (isLinux) {
		module.exports.linux32 = {
			cwd: 'webkitbuilds/releases/' + pkgName + '/linux32/' + pkgName + '/',
			src: [
				'webkitbuilds/releases/' + pkgName + '/linux32/' + pkgName + '/**',
			],
			dest: 'webkitbuilds/archives/XigenTimer_linux32_' + release + '.zip'
		};

		module.exports.linux64 = {
			cwd: 'webkitbuilds/releases/' + pkgName + '/linux64' + pkgName + '/',
			src: [
				'webkitbuilds/releases/' + pkgName + '/linux64' + pkgName + '/**',
			],
			dest: 'webkitbuilds/archives/XigenTimer_linux64_' + release + '.zip'
		};
	}

}());