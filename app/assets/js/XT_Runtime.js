/* globals io */

window.$ = window.jQuery = require('./assets/js/jquery.min.js');

$(function () {

	"use strict";

	var setup,
		socket,
		timer,
		ready,
		loginError;

	XT.socket = socket = io.connect("http://localhost:8080");
	XT.viewmodel = new XT.ViewModel();

	ko.applyBindings(XT.viewmodel);

	setup = function (userToken, userName) {

		socket.emit("setup", {
			"userToken" : userToken,
			"userName" : userName
		});
	};

	loginError = function () {

		var btn = $(".xt__login").find("button");

		btn.removeClass("btn--white").
			addClass("btn--yellow").
			text(XT.i18n.loginErrors[Math.floor(Math.random() * XT.i18n.loginErrors.length)]);

		setTimeout(function () {

			btn.removeClass("btn--yellow").
				addClass("btn--white").
				text(XT.i18n.loginBtn);

		}, 2500);

	};

	socket.on("ready", function (isReady) {
		
		if (isReady) {
			ready();
		} else {
			loginError();
		}

	});

	$(".xt__login").on("submit", function (e) {
		e.preventDefault();

		var form = $(e.target),
			username = form.find("[name=username]").val(),
			password = form.find("[name=pass]").val(),
			token;

		token = "Basic " + btoa(username + ":" + password);

		setup(token, username);

	});

	window.timer = timer = new XT.Timer($(".xt__timer__clock"));

	ready = function () {

		XT.drawProjectList(function () {
			var nav = new XT.HierachyList();
		});

		XT.viewmodel.currentPage("timer");

		$("[data-startstop]").on("click", function (e) {
			e.preventDefault();

			if (timer.isRunning) {
				timer.stop();
				$(this).text(XT.i18n.timerpaused);
			} else {
				timer.start();
				$(this).text(XT.i18n.timerrunning);
			}

		});

		$("[data-showtask]").hover(
		function () {
			$(".project_overlay").addClass("is-visible");
		},
		function () {
			$(".project_overlay").removeClass("is-visible");
		}
		);

	};

});