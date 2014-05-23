(function (xt) {

	"use strict";

	xt.ViewModel = function () {

		this.currentPage = ko.observable("login");

		this.loginGreeting = ko.computed(function () {

			var x = 5,
				item = Math.floor(Math.random()*x);

			return XT.i18n.loginGreetings[item];

		});

		this.currentPage.subscribe(function (newVal) {

			if (newVal === "logs") {
				XT.drawGraph();
			};

		});

	};

}(XT));