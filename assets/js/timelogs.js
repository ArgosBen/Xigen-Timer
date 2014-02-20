(function () {

	var config = {
		TABLE_CLASS: ".time-table",
		TEXT_EDIT: "Edit",
		TEXT_SAVE: "Save",
		TEXT_SAVING: "Saving..."
	};

	function getTaskName(ID, callback) {

		var ret,
			taskName,
			projName,
			taskID;

		localforage.getItem("activityCache", function (acts) {

			ret = acts.filter(function (a) {
				return a.TaskID === ID;
			})[0];

			taskName = ret.Name;
			taskID = ret.EntityBaseID;

		}).then(getProjectName);

		function getProjectName () {

			localforage.getItem("projectCache", function (projects) {

				ret = projects.filter(function (a) {
					return a.ProjectID === ret.ProjectID;
				})[0];

				projName = ret.Name;

				callback([taskName, projName, taskID]);

			});

		}

	}

	getTodaysDate = function () {

		var date = new Date();

		return formattedDate = [
			date.getFullYear(),
			date.getMonth().toString().length === 1 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1,
			date.getDate().toString().length === 1 ? "0" + date.getDate() - 1 : date.getDate() - 1,
		].join('-');

	}

	XIGENTIMER.renderTimeLogs = function () {

		XIGENTIMER.API.getTimelogs(function (logs) {

			var table = $(config.TABLE_CLASS + " tbody"),
				log,
				name,
				date = getTodaysDate(),
				loaded = 0,
				frag = document.createDocumentFragment();

			logs = logs.filter(function (log) {

				return log.Locked !== "Locked" && log.EntryDate.indexOf(date) > -1;

			}).reverse();

			if (logs.length > 0) {
				
				$.each(logs, function (i) {

					getTaskName(this.TaskID, function (result) {
						name = result;

						var row = document.createElement("tr");

						row.setAttribute("data-id", logs[i].EntityBaseID);
						row.setAttribute("data-taskId", logs[i].TaskID);

						$(row).append("<td><strong>" + name[1] + ":</strong><br/><a target='_system' href='http://projectsvm.xigen.co.uk/TaskDetails.aspx?ID=" + name[2] + "'>" + name[0] + "</a></td>");
						$(row).append("<td>" + logs[i].Duration.toFixed(2) + "</td>");
						$(row).append("<td>" + logs[i].Description + "</td>");
						$(row).append("<td><button class='button tiny success expand'>" + config.TEXT_EDIT + "</button></td>");

						frag.appendChild(row);

						loaded += 1;

						if (loaded === logs.length) {
							table.empty();
							table[0].appendChild(frag);
						}

					});

				});

			} else {

				var row = document.createElement("tr");

				$(row).append("<td align='center' colspan='4'><strong>No time logged for today yet - Do some work!</strong></td>");
				frag.appendChild(row);
				table.empty();
				table[0].appendChild(frag);

			}

		});

	};

	XIGENTIMER.editTimeLog = function (logID, triggerEl) {

		console.log(logID);

		var row = $(config.TABLE_CLASS + " tbody").find("[data-id='" + logID + "']"),
			taskID = row.attr("data-taskId"),
			descCell = row.find("td").eq(2),
			durCell = row.find("td").eq(1),
			desc = descCell.text(),
			dur = durCell.text(),
			isValid = /[0-9]{1,2}\.[0-9]{1,2}/,
			validates = true;

		if (!triggerEl.jquery) {
			triggerEl = $(triggerEl);
		}

		durCell.html("<input maxlength='5' type='text' value='" + dur + "' />");
		descCell.html("<textarea>" + desc + "</textarea>");

		triggerEl.text(config.TEXT_SAVE);

		triggerEl.on("click", function () {

			desc = descCell.find("textarea").val();
			dur = durCell.find("input").val();

			if (!isValid.test(dur)) {
				durCell.find("input").addClass("error");

				validates = false;

				durCell.find("input").on("keyup", function () {
					if (isValid.test($(this).val())) {
						durCell.find("input").removeClass("error");
						validates = true;
					} else {
						durCell.find("input").addClass("error");
					}
				});

			}

			if (validates) {

				triggerEl.attr("disabled", "disabled");
				triggerEl.text(config.TEXT_SAVING);

				XIGENTIMER.API.updateTimeLog(logID, dur, desc, function (success) {

					descCell.html(desc);
					durCell.html(dur);

					triggerEl.removeAttr("disabled");
					triggerEl.text(config.TEXT_EDIT);

					triggerEl.off("click");

				});
			}
		
		});

	}

}());