(function () {

	var grunt = require('grunt'),
		isWin = grunt.file.isDir('webkitbuilds/releases/Xigen-EasyProjects-Timer/win/'),
		isMac =  grunt.file.isDir('webkitbuilds/releases/Xigen-EasyProjects-Timer/mac/'),
		isLinux = grunt.file.isDir('webkitbuilds/releases/Xigen-EasyProjects-Timer/linux32/'),
		release = grunt.file.readJSON('package.json').version;

	module.exports = {};

	if (isWin) {
		module.exports.win = {
			options: {
				archive: 'webkitbuilds/archives/XigenTimer_win_' + release + '.zip'
			},
			files: {
				src: ['webkitbuilds/releases/**/win/*', 'webkitbuilds/releases/**/win/**/*'],
				filter: 'isFile'
			}
		};
	}

	if (isMac) {
		module.exports.mac = {
			options: {
				archive: 'webkitbuilds/archives/XigenTimer_osx_' + release + '.zip'
			},
			files: {
				src: ['webkitbuilds/releases/**/mac/Xigen-EasyProjects-Timer.app']
			}
		};
	}

	if (isLinux) {
		module.exports.linux32 = {
			options: {
				archive: 'webkitbuilds/archives/XigenTimer_linux32_' + release + '.zip'
			},
			files: {
				src: ['webkitbuilds/releases/**/linux32/*', 'webkitbuilds/releases/**/linux32/**/*']
			}
		};

		module.exports.linux64 = {
			options: {
				archive: 'webkitbuilds/archives/XigenTimer_linux64_' + release + '.zip'
			},
			files: {
				src: ['webkitbuilds/releases/**/linux64/*', 'webkitbuilds/releases/**/linux64/**/*']
			}
		};
	}

}());