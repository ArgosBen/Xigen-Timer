(function (xt) {

	"use strict";

	var config = {
		SIDEBAR: ".xt__timer--sidebar__list"
	};

	xt.HierachyList = function () {

		this.init.apply(this, arguments);

	};

	xt.HierachyList.prototype = {

		init: function () {

			this.el = $(config.SIDEBAR).children("ul");

			this.addHandlers();

		},

		addHandlers: function () {

			this.el.on("click", "li span", function (e) {

				$(e.target).toggleClass("is-open");
				
				$(e.target).parent().children("ul").toggle();

			});

		}

	};

}(XT));