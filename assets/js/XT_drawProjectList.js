(function (xt) {

	"use strict";

	var config,
		draw,
		listFromActivites;

	config = {
		"SIDEBAR" : ".xt__timer--sidebar"
	};

	listFromActivites = function (activities, isProjectList) {

		if (!activities) {
			return false;
		}

		if (isProjectList) {
			activities = activities.filter(function (act) {
				return act.Activities.length > 0;
			});
			console.log(activities);
		}

		var ul = document.createElement("ul"),
			li;

		$.each(activities, function () {

			li = document.createElement("li");

			$(li).append("<span>" + this.Name + "</span>");

			$(li).append(listFromActivites(this.Activities));
			ul.appendChild(li);

		});

		return ul;

	};

	draw = function (data) {

		var targetList;

		$(config.SIDEBAR).find("ul").remove();
		$(config.SIDEBAR).append("<ul />");

		targetList = $(config.SIDEBAR).find("ul");

		console.log(data);

		$(config.SIDEBAR).append(listFromActivites(data, true));

	};

	xt.drawProjectList = function () {

		xt.socket.emit("getHierachy");

		xt.socket.once("hierachy", draw);

	};

}(XT));