module.exports = {
    main: {
        options: {
            //sourceMap: function(path) { return path.replace(/.js/,".map") },
        },
        files: {
            'assets/dist/EasyTimer.min.js': ['assets/dist/src/EasyTimer_Production.js']
        }
    },
    manage: {
        options: {
            //sourceMap: function(path) { return path.replace(/.js/,".map") },
        },
        files: {
            'assets/dist/EasyTimer_ManageTask.min.js': ['assets/dist/src/EasyTimer_ManageTask.js']
        }
    },
    view: {
        options: {
            //sourceMap: function(path) { return path.replace(/.js/,".map") },
        },
        files: {
            'assets/dist/EasyTimer_ViewTask.min.js': ['assets/dist/src/EasyTimer_ViewTask.js']
        }
    }
};