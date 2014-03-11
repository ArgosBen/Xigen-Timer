(function () {

	var files = [
		'./package.json',
		'./index.html',
		'./viewActivity.html',
		'./ManageActivity.html',
		'./notification.html',
		'./node_modules/**/*',
		'./assets/**/*'
	];

	module.exports = {
		all: {
			options: {
				version: '0.9.2',
				build_dir: './webkitbuilds', // Where the build version of my node-webkit app is saved
				mac: true,
				win: true,
				linux32: true,
				linux64: true
			},
			src: files
		},
		win: {
			options: {
				version: '0.9.2',
				build_dir: './webkitbuilds', // Where the build version of my node-webkit app is saved
				mac: false,
				win: true,
				linux32: false,
				linux64: false
			},
			src: files
		},
		mac: {
			options: {
				version: '0.9.2',
				build_dir: './webkitbuilds', // Where the build version of my node-webkit app is saved
				mac: true,
				win: false,
				linux32: false,
				linux64: false
			},
			src: files
		},
		linux: {
			options: {
				version: '0.9.2',
				build_dir: './webkitbuilds', // Where the build version of my node-webkit app is saved
				mac: false,
				win: false,
				linux32: true,
				linux64: true
			},
			src: files
		}
	};

}());