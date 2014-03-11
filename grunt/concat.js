module.exports = {
    js: {
        files: {
            'assets/dist/src/EasyTimer_Production.js' : [
                'assets/js/lib/jquery.js',
                'assets/js/lib/ko.js',
                'assets/js/lib/modernizr.js',
                'assets/js/foundation/foundation.js',
                'assets/js/foundation/foundation.reveal.js',
                'assets/js/foundation/foundation.tooltip.js',
                'assets/js/localforage.js',
                'assets/js/flipclock.js',
                'assets/js/moment.min.js',
                'assets/js/pikaday.js',
                'assets/js/API.js',
                'assets/js/viewmodel.js',
                'assets/js/filter.js',
                'assets/js/window.js',
                'assets/js/updateProjectList.js',
                'assets/js/procedural.js',
                'assets/js/updateHours.js',
                'assets/js/timer.js',
                'assets/js/sendTime.js',
                'assets/js/timelogs.js',
                'assets/js/authorise.js',
                'assets/js/reset.js',
                'assets/js/key.js',
                'assets/js/state.js',
                'assets/js/tasks.js',
                'assets/js/notify.js'
            ],
            'assets/dist/src/EasyTimer_ViewTask.js' : [
                'assets/js/lib/jquery.js',
                'assets/js/lib/ko.js',
                'assets/js/foundation/foundation.js',
                'assets/js/foundation/foundation.reveal.js',
                'assets/js/localforage.js',
                'assets/js/flipclock.js',
                'assets/js/moment.min.js',
                'assets/js/pikaday.js',
                'assets/js/API.js',
                'assets/js/key.js',
                'assets/js/window.js',
                'assets/js/procedural_activityView.js'
            ],
            'assets/dist/src/EasyTimer_ManageTask.js' : [
                'assets/js/lib/jquery.js',
                'assets/js/lib/ko.js',
                'assets/js/foundation/foundation.js',
                'assets/js/foundation/foundation.reveal.js',
                'assets/js/localforage.js',
                'assets/js/flipclock.js',
                'assets/js/moment.min.js',
                'assets/js/pikaday.js',
                'assets/js/API.js',
                'assets/js/AssigneeRender.js',
                'assets/js/key.js',
                'assets/js/window.js',
                'assets/js/procedural_manageView.js'
            ]
        }
    },
    css: {
        files: {
            'assets/dist/XigenTimer.css' : [
                'assets/css/XigenTimer.css',
                'assets/css/pikaday.css',
                'assets/css/flipclock.css'
            ]
        }
    }
};