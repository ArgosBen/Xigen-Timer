window.$ = window.jQuery = require('./assets/js/jquery.min.js');
$(function () {

	var remote = require("remote"),
		win = remote.getCurrentWindow(),
		isMiniMode = false,
		pos,
		tx,
		ty;

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

			tx = parseInt(pos[0] + ((1000 - 680) / 2), 10);
			ty = parseInt(pos[1] + ((600 - 315) / 2), 10);

			console.log(tx, ty);

			win.setResizable(true);
			win.setSize(680, 315);
			win.setPosition(tx, ty);
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

			tx = parseInt(pos[0] - ((1000 - 680) / 2), 10);
			ty = parseInt(pos[1] - ((600 - 315) / 2), 10);

			console.log(tx, ty);

			win.setResizable(true);
			win.setSize(1000, 600);
			win.setPosition(tx, ty);
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