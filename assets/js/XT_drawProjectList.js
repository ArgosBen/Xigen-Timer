(function (xt) {

	"use strict";

	var config,
		draw,
		listFromActivites;

	config = {
		"SIDEBAR" : ".xt__timer--sidebar__list"
	};

	listFromActivites = function (activities, isProjectList) {

		if (!activities) {
			return false;
		}

		if (isProjectList) {
			activities = activities.filter(function (act) {
				return act.Activities.length > 0;
			});
		}

		var ul = document.createElement("ul"),
			li;

		$.each(activities, function () {

			li = document.createElement("li");

			$(li).append("<span>" + this.Name + "</span>");

			$(li).append(listFromActivites(this.Activities, false));

			ul.appendChild(li);

		});

		return ul;

	};

	draw = function (data) {

		var targetList;

		$(config.SIDEBAR).find("ul").remove();
		$(config.SIDEBAR).addClass("empty");

		targetList = $(config.SIDEBAR).find("ul");

		$(config.SIDEBAR).append(listFromActivites(data, true));
		$(config.SIDEBAR).removeClass("empty");

	};

	xt.drawProjectList = function () {

		xt.socket.emit("getHierachy");

		xt.socket.once("hierachy", draw);

	};

}(XT));