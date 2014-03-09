module.exports = {
    my_target: {
        options: {
            sourceMap: function(path) { return path.replace(/.js/,".map") },
        },
        files: {
            'assets/dist/EasyTimer.min.js': ['assets/dist/src/EasyTimer_Production.js'],
            'assets/dist/EasyTimer_ViewTask.min.js': ['assets/dist/src/EasyTimer_ViewTask.js'],
            'assets/dist/EasyTimer_ManageTask.min.js': ['assets/dist/src/EasyTimer_ManageTask.js']
        }
    }
};