$(function () {

	"use strict";

	var bd = $("body");

	$(document).on("konami", function () {

		bd.css({
			"transition": "-webkit-transform 3s ease-in-out",
			"-webkit-transform": "rotate(720deg)",
			"overflow": "hidden"
		});

		setTimeout(function () {

			bd.css({
				"transition": "none",
				"-webkit-transform": "rotate(0deg)",
				"overflow": "visible"
			});

		}, 3000);

	});

});