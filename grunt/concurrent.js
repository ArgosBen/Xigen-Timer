module.exports = {
	js: {
		tasks: ['uglify:main', 'uglify:manage', 'uglify:view']
	},
	compress: {
		tasks: ['js', 'css']
	}
};