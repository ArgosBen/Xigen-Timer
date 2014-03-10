(function (timer) {

	"use strict";

	var gui = require('nw.gui'),
		config = {
			WINDOW_WIDTH: 290,
			WINDOW_HEIGHT: 55,
			TARGET_X: screen.availWidth - 290 - 10,
			TARGET_Y: screen.availHeight - 55 - 10
		};

	timer.notify = function (title, message) {

		var notificationWindow = gui.Window.open("notification.html?title=" + encodeURIComponent(title) + "&message=" + encodeURIComponent(message), {
				frame: false,
				title: "Notification Window",
				toolbar: false,
				width: config.WINDOW_WIDTH,
				height: config.WINDOW_HEIGHT,
				x: screen.availWidth - config.WINDOW_WIDTH - 10,
				y: screen.availHeight + 100
			}),
			interval;

		notificationWindow.setAlwaysOnTop(true);

		interval = setInterval(function () {

			if (notificationWindow.y > config.TARGET_Y) {
				notificationWindow.moveTo(notificationWindow.x, notificationWindow.y -= 5);
			} else {
				clearInterval(interval);
			}

		}, 5);

		setTimeout(function () {

			interval = setInterval(function () {

				if (notificationWindow.y < screen.availHeight + 50) {
					notificationWindow.moveTo(notificationWindow.x, notificationWindow.y += 5);
				} else {
					clearInterval(interval);
					notificationWindow.close();
				}

			}, 5);
		
		}, 5000);

	};

}(XIGENTIMER));