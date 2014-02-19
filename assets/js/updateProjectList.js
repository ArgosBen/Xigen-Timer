(function () {

	"use strict";

	var drawActivityList = function(data) {

		var ul = $(document.createElement("ul")),
			label;

		$.each(data, function () {

			switch (this.TaskTypeID) {
			case 2:
				label = "<div class='label alert'>Issue</div>";
				break;
			case 3:
				label = "<div class='label success'>Request</div>";
				break;
			default:
				label = "<div class='label'>Task</div>";
				break;
			}

			ul.append("<li data-id='" + this.EntityBaseID + "'><a href='#'>" + label + "<span>" + this.Name + "</span></a></li>");

		});

		return ul;

	};

	XIGENTIMER.updateProjectList = function (callback) {

		XIGENTIMER.API.getProjects(function (projects) {

			var sidebar = $(".side-nav"),
				frag = document.createDocumentFragment(),
				newLI,
				newUL,
				filteredActivities,
				li,
				label,
				prevActive = [];

			sidebar.find(".is-open").each(function () {

				prevActive.push($(this).text());

			});

			sidebar.empty();

			$.each(projects.filter(function (i) {
				return i.Activities.length > 0;
			}), function (i, proj) {

				newLI = $(document.createElement("li"));

				newLI.append("<span>" + proj.Name + "</span>");

				if (proj.Activities && proj.Activities.length > 0) {

					newUL = $(document.createElement("ul"));

					filteredActivities = proj.Activities.filter(function (i) {

						return !i.isHidden && (i.TaskStatusID === 4 || i.TaskStatusID === 1);

					});

					$.each(filteredActivities, function (i, act) {

						switch (act.TaskTypeID) {
						case 2:
							label = "<div class='label alert'>Issue</div>";
							break;
						case 3:
							label = "<div class='label success'>Request</div>";
							break;
						default:
							label = "<div class='label'>Task</div>";
							break;
						}

						if (!act.Activities) {
							newUL.append("<li data-id='" + act.EntityBaseID + "'><a href='#'>" + label + "<span>" + act.Name + "</span></a></li>");
						} else {
							li = $("<li data-id='" + act.EntityBaseID + "'><span>" + act.Name + "</span></li>");
							li.append(drawActivityList(act.Activities));
							newUL.append(li);
						}

					});

					newLI.append(newUL);

				}

				if (filteredActivities.length > 0) {
					frag.appendChild(newLI[0]);
				}

			});

			if (sidebar[0]) {
				sidebar[0].appendChild(frag);
			}

			if (typeof callback === "function") {
				callback(prevActive);
			}

		});

	};

}());