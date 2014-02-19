(function () {

	var gui = require('nw.gui');
	
	XIGENTIMER.launchExternal = function (url) {

		gui.Shell.openExternal(url);

	}

}());