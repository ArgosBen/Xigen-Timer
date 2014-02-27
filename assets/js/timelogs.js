/* globals moment */
(function () {

	"use strict";

	var config = {
		TABLE_CLASS: ".time-table-logs",
		TEXT_EDIT: "Edit",
		TEXT_SAVE: "Save",
		TEXT_SAVING: "Saving..."
	};

	function getTaskName(ID, callback) {

		var ret,
			taskName,
			projName,
			taskID,
			getProjectName;

		localforage.getItem("activityCache", function (acts) {

			ret = acts.filter(function (a) {
				return a.TaskID === ID;
			})[0];

			if (ret) {
				taskName = ret.Name;
				taskID = ret.EntityBaseID;

				getProjectName();
			}

		});

		getProjectName = function () {

			localforage.getItem("projectCache", function (projects) {

				ret = projects.filter(function (a) {
					return a.ProjectID === ret.ProjectID;
				})[0];

				projName = ret.Name;

				callback([taskName, projName, taskID]);

			});

		};

	}

	function getTodaysDate () {

		var date = new Date();

		return [
			date.getFullYear(),
			date.getMonth().toString().length === 1 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1,
			date.getDate().toString().length === 1 ? "0" + date.getDate() : date.getDate(),
		].join('-');

	}

	XIGENTIMER.renderTimeLogs = function (dateRange) {

		XIGENTIMER.API.getTimelogs(function (logs) {

			var table = $(config.TABLE_CLASS + " tbody"),
				log,
				name,
				date = getTodaysDate(),
				loaded = 0,
				frag = document.createDocumentFragment(),
				timeSince,
				dateA,
				dateB;

			logs = logs.filter(function (log) {

				timeSince = +moment(log.EntryDate, "YYYY-MM-DD/HH:mm:ss.SS");

				return log.Locked !== "Locked" && !log.Approved && timeSince >= dateRange[0] && timeSince <= dateRange[1];

			}).sort(function (a, b) {

				dateA = +moment(a.EntryDate, "YYYY-MM-DD/HH:mm:ss.SS");
				dateB = +moment(b.EntryDate, "YYYY-MM-DD/HH:mm:ss.SS");

				if (dateA < dateB) {
					return -1;
				} else if (dateA > dateB) {
					return 1;
				}
				return 0;

			}).reverse();

			if (logs.length > 0) {
				
				$.each(logs, function (i) {

					getTaskName(this.TaskID, function (result) {
						name = result;

						var row = document.createElement("tr");

						row.setAttribute("data-id", logs[i].EntityBaseID);
						row.setAttribute("data-taskId", logs[i].TaskID);

						timeSince = moment(logs[i].EntryDate, "YYYY-MM-DD/HH:mm:ss.SS");

						$(row).append("<td><strong>" + timeSince.calendar() + "</strong><br/>(" + timeSince.format('DD-MM-YYYY') + ")</td>");
						$(row).append("<td><strong>" + name[1] + ":</strong><br/><a target='_system' href='http://projects.xigen.co.uk/TaskDetails.aspx?ID=" + name[2] + "'>" + name[0] + "</a></td>");
						$(row).append("<td>" + logs[i].Duration.toFixed(2) + "</td>");
						$(row).append("<td>" + logs[i].Description + "</td>");
						$(row).append("<td><button data-bind='disable: !isConnected()' class='button tiny success expand do-editTimeLog'>" + config.TEXT_EDIT + "</button></td>");

						frag.appendChild(row);

						loaded += 1;

						if (loaded === logs.length) {
							table.empty();
							table[0].appendChild(frag);
							$.each(table.find("tr"), function () {
								ko.applyBindings(XIGENTIMER.VIEWMODEL, this);
							});
						}

					});

				});

			} else {

				var row = document.createElement("tr");

				$(row).append("<td align='center' colspan='4'><strong>No time logged for these dates - Do some work!</strong></td>");
				frag.appendChild(row);
				table.empty();
				table[0].appendChild(frag);

			}

		});

	};

	XIGENTIMER.editTimeLog = function (logID, triggerEl) {

		var row = $(config.TABLE_CLASS + " tbody").find("[data-id='" + logID + "']"),
			taskID = row.attr("data-taskId"),
			descCell = row.find("td").eq(3),
			durCell = row.find("td").eq(2),
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

	};

	XIGENTIMER.updateDatePickers = function () {

		var from = $("[data-start]").data("picker"),
			to = $("[data-end]").data("picker"),
			dateRange = [];

		to.setMinDate(from.getDate());
		from.setMaxDate(to.getDate());

		dateRange.push(+from.getDate());
		dateRange.push(+moment(to.getDate()).add('hours', 24));

		XIGENTIMER.renderTimeLogs(dateRange);

	};

}());