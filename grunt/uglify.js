module.exports = {
    my_target: {
        options: {
            sourceMap: true,
            sourceMapName: 'assets/dist/EasyTimer.map'
        },
        files: {
            'assets/dist/EasyTimer.min.js': ['assets/dist/EasyTimer_Production.js']
        }
    }
};