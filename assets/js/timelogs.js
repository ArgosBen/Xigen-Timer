(function () {

	var config = {
		TABLE_CLASS: ".time-table"
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
			taskID = ret.TaskID;

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

	XIGENTIMER.renderTimeLogs = function () {

		XIGENTIMER.API.getTimelogs(function (logs) {

			var table = $(config.TABLE_CLASS),
				log,
				name;

			logs = logs.filter(function (log) {

				return log.Locked !== "Locked";

			});

			$.each(logs, function (i) {

				getTaskName(this.TaskID, function (result) {
					name = result;

					var row = document.createElement("tr");

					$(row).append("<td><strong>" + name[1] + ":</strong><br/><a target='_system' href='http://projectsvm.xigen.co.uk/TaskDetails.aspx?ID='" + name[2] + "'>" + name[0] + "</a></td>");
					$(row).append("<td>" + logs[i].Duration.toFixed(2) + "</td>");
					$(row).append("<td>" + logs[i].Description + "</td>");
					$(row).append("<td><button class='button tiny success'>Edit</button></td>");

					table.append(row);

				});

			});

		});

	};

	if ($(config.TABLE_CLASS).length) {
		XIGENTIMER.renderTimeLogs();
	}

}());