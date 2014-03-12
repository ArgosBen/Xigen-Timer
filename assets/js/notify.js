(function (timer) {

	"use strict";

	var gui = require('nw.gui'),
		config = {
			WINDOW_WIDTH: 290,
			WINDOW_HEIGHT: 55
		},
		popupIsOpen = false,
		os = require('os'),
		notifier;

	if (!/darwin/.test(os.platform())) {
		timer.notify = function (title, message) {

			if (popupIsOpen) {
				return false;
			}

			var notificationWindow = gui.Window.open("notification.html?title=" + encodeURIComponent(title) + "&message=" + encodeURIComponent(message), {
					frame: false,
					title: "Notification Window",
					toolbar: false,
					width: config.WINDOW_WIDTH,
					height: config.WINDOW_HEIGHT,
					x: screen.availWidth - config.WINDOW_WIDTH - 10,
					y: screen.availHeight - config.WINDOW_HEIGHT - 10,
					"always-on-top" : true,
					"show_in_taskbar" : false,
					show: true
				});

			setTimeout(function () {
				popupIsOpen = false;
			}, 5000);

		};
	} else {

		if (!notifier) {
			notifier = require('osx-notifier');
		}

		timer.notify = function (title, message) {

			notifier({
				type: 'info',
				title: title,
				message: message,
				group: 'XigenTimer',
			});

		};

	}

}(XIGENTIMER));