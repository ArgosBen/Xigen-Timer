$(function () {

	"use strict";

	var config = {
			DO_STARTTIME: "do-timestart",
			DO_PAUSE: "do-timestop",
			TEXT_RUNNING: "Pause",
			TEXT_PAUSED: ""
		},
		modal = XIGENTIMER.UPDATEPOPUP,
		h = modal.find("[name=hours]"),
		m = modal.find("[name=minutes]"),
		s = modal.find("[name=seconds]"),
		hours,
		minutes,
		seconds,
		totalSeconds;

	// Get the default text
	config.TEXT_PAUSED = $("." + config.DO_STARTTIME).text();

	// Make a timer
	XIGENTIMER.TIMER = $(".timer").FlipClock({
		autoStart: false
	});

	// Make sure we arent timing
	XIGENTIMER.VIEWMODEL.isTiming(false);

	$("." + config.DO_STARTTIME).on("click", function (e) {

		if ($(this).attr("disabled")) {
			return false;
		}

		if (!XIGENTIMER.VIEWMODEL.isTiming()) {

			XIGENTIMER.TIMER.start();
			XIGENTIMER.VIEWMODEL.isTiming(true);

			$(this).text(config.TEXT_RUNNING);

		} else {

			XIGENTIMER.TIMER.stop(function () {

				totalSeconds = XIGENTIMER.TIMER.getTime() - 1;

				hours = Math.floor(totalSeconds / (60 * 60));

				totalSeconds -= (3600 * hours);

				minutes = Math.floor(totalSeconds / (60));

				totalSeconds -= (60 * minutes);

				h.val(hours);
				m.val(minutes);
				s.val(totalSeconds);

				XIGENTIMER.VIEWMODEL.isTiming(false);

			});

			$(this).text(config.TEXT_PAUSED);

		}

	});

});