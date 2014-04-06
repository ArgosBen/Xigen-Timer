$(function () {

	"use strict";

	var setup,
		socket,
		ready;

	XT.socket = socket = io.connect("http://localhost:8080");

	setup = function () {
		socket.emit("setup", {
			"userToken" : "Basic bWF0dG06anI3NGFuQVE=",
			"userName" : "mattm"
		});
	};

	socket.on("send setup", function () {
		setup();
	});

	socket.on("ready", function (isReady) {
		
		if (isReady) {
			ready();
		}

	});

	setup();

	window.timer = new XT.Timer($(".xt__timer__clock"));

	ready = function () {

		XT.drawProjectList();

	};

});