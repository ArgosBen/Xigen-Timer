(function () {

	var gui = require('nw.gui'),
		win = gui.Window.get(),
		tray,
		menu = new gui.Menu(),
		message;

	menu.append(new gui.MenuItem({type: "normal", label: "Show Timer"}));
	
	XIGENTIMER.launchExternal = function (url) {
		gui.Shell.openExternal(url);
	};

	XIGENTIMER.close = function (url) {
		if (XIGENTIMER.VIEWMODEL.isLoggedIn() && (XIGENTIMER.VIEWMODEL.isTiming() || XIGENTIMER.TIMER.getTime().time > 1)) {

			if (XIGENTIMER.VIEWMODEL.isTiming()) {
				message = "Timer is running, are you sure you want to close?";
			} else if (XIGENTIMER.TIMER.getTime().time > 1) {
				message = "There is time on the clock which hasn't been sent yet. Are you sure you want to close?";
			}

			if (confirm(message)) {
				win.close();
			}

		} else {

			win.close();
	
		}
	};

	XIGENTIMER.minimize = function (url) {
		win.minimize();
	};

	XIGENTIMER.goToTray = function () {

		win.once('minimize', function() {
			// Hide window
			this.hide();

			// Show tray
			tray = new gui.Tray({ icon: 'assets/img/xigen_logo_whiteout.png' });

			// Show window and remove tray when clicked
			tray.on('click', function() {
				win.show();
				this.remove();
				tray = null;
		  	});

			tray.menu = menu;

			menu.items[0].click = function () {
				win.show();
				tray.remove();
				tray = null;
			}

		});

		win.minimize();

	}

}());