$(function () {

	"use strict";

	var config = {
			SEND_CLASS: "do-send",
			PENDING_TEXT: "Sending...",
			MARKING_TEXT: "Marking for review...",
			SUCCESS_TEXT: "Done!",
			ERROR_TEXT: "Error :(",
			DESC_SEL: "[id=desc]"
		},
		resetAll;

	config.DEFAULT_TEXT = $("." + config.SEND_CLASS).text();

	$("." + config.SEND_CLASS).on("click", function () {

		var desc = $(config.DESC_SEL).val(),
			taskID = XIGENTIMER.VIEWMODEL.selectedProject(),
			dur,
			isBillable = $("#isBillable").prop("checked"),
			isForReview = $("#markReview").prop("checked"),
			userID,
			logTime,
			successFn,
			btn = $(this);

		dur = XIGENTIMER.TIMER.getTime() / 3600;
		dur = dur.toFixed(2);

		successFn = function () {

			btn.text(config.SUCCESS_TEXT);

			setTimeout(function () {
				btn.text(config.DEFAULT_TEXT);
			}, 3000);

		};

		$(this).text(config.PENDING_TEXT);

		localforage.getItem("user", function (u) {
			userID = u.UserID;
		}).then(function () {

			XIGENTIMER.API.logTime(userID, taskID, dur, isBillable, desc, function (success) {

				if (success) {

					if (!isForReview) {

						successFn();

					} else {
						
						XIGENTIMER.API.markForReview(taskID, function () {
							successFn();
						});
					}

					XIGENTIMER.reset();

				} else {

					btn.removeClass("info")
						.addClass("alert")
						.text(config.ERROR_TEXT);

					setTimeout(function () {
						btn.text(config.DEFAULT_TEXT)
							.addClass("info")
							.removeClass("alert");
					}, 1500);

				}

			});

		});

	});

});