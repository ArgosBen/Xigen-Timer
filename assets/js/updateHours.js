$(function () {

	"use strict";

	var config = {
			ERROR_CLASS: "error",
			UPDATE_CLASS: "do-update",
			MODAL_ID: "customTime",
			CLOSE_CLASS: "do-close"
		},
		successFn;

	successFn = function (e) {

		var h,
			m,
			s,
			modal = $("#" + config.MODAL_ID),
			validates = true;

		e.preventDefault();

		h = modal.find("[name=hours]");
		m = modal.find("[name=minutes]");
		s = modal.find("[name=seconds]");

		$.each([h, m, s], function () {

			if (!$(this).val()) {
				$(this).prev("label").addClass(config.ERROR_CLASS);
				
				$(this).on("keyup", function () {
					if ($(this).val()) {
						$(this).prev("label").removeClass(config.ERROR_CLASS);
					} else {
						$(this).prev("label").addClass(config.ERROR_CLASS);
					}
				});

				validates = false;
			} else {
				$(this).prev("label").removeClass(config.ERROR_CLASS);
			}

		});

		if (validates) {

			h = parseInt(h.val(), 10) * 60 * 60;
			m = parseInt(m.val(), 10) * 60;
			s = parseInt(s.val(), 10);

			XIGENTIMER.TIMER.setTime(h + m + s);

			modal.foundation('reveal', 'close');

			XIGENTIMER.VIEWMODEL.recalcCanSend();

		}

	};

	// The popup for updating hours
	$("." + config.UPDATE_CLASS).on("click", function (e) {
		successFn(e);
	});

	$(document).on("keyup", function (e) {

		if (e.which === 13) {
			successFn(e);
		}
	
	});

	$("#" + config.MODAL_ID).on("click", "." + config.CLOSE_CLASS, function () {
		$("#" + config.MODAL_ID).foundation('reveal', 'close');
	});

	XIGENTIMER.UPDATEPOPUP = $("#" + config.MODAL_ID);

});