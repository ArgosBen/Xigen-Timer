window.$ = window.jQuery = require('./assets/js/jquery.min.js');
$(function () {

	var remote = require("remote"),
		win = remote.getCurrentWindow(),
		isMiniMode = false,
		pos;

	XT.miniMode = function () {

		pos = win.getPosition();

		if (!isMiniMode) {

			$(".xt__nav").
			add(".xt__timer--sidebar").
			add(".xt__timer__desc, .xt__timer__desc ~ *").
			add(".btn--group .btn:not([data-minimode])").
			add(".xt__timer__callout, .xt__timer__callout + .btn").
			hide();

			$(".xt__timer--main").css({
				"width" : "100%",
				"margin-left" : 0,
				"-webkit-app-region" : "drag"
			});

			$("[data-togglemini]").css({
				"display" : "block",
				"margin-bottom" : "10px"
			});

			$("[data-minimize]").css("display", "block");

			$(".btn").css("-webkit-app-region", "no-drag");

			win.setResizable(true);
			win.setSize(680, 315);
			//win.setPosition(pos[0] + ((1000 - 680) / 2), pos[0] + ((600 - 315) / 2));
			win.setResizable(false);

			isMiniMode = true;

		} else {

			$(".xt__nav").
			add(".xt__timer--sidebar").
			add(".xt__timer__desc, .xt__timer__desc ~ *").
			add(".btn--group .btn:not([data-minimode])").
			add(".xt__timer__callout, .xt__timer__callout + .btn").
			show();

			$(".xt__timer--main").removeAttr("style");

			$("[data-togglemini], [data-minimize]").removeAttr("style");

			$(".btn").removeAttr("style");

			win.setResizable(true);
			win.setSize(1000, 600);
			//win.setPosition(pos[0] - (1000 - 680) / 2, pos[0] - (600 - 315) / 2);
			win.setResizable(false);

			isMiniMode = false;

		}

		$("[data-togglemini]").on("click", function () {
			XT.miniMode();
		});

		$("[data-minimize]").on("click", function () {
			win.minimize();
		});

	};

});