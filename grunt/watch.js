module.exports = {
	scripts: {
		files: ['assets/js/**/*.js', 'assets/js/*.js'],
		tasks: ['concat', 'uglify']
	},
	sass: {
		files: ['assets/scss/**/*.scss'],
		tasks: ['sass', 'notify:sass']
	}
};