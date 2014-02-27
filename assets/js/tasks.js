(function (timer) {

	"use strict";

	var main;

	timer.drawTaskList = function () {

		main();

	};

	main = function () {

		var tasks,
			filterTasks,
			getAdditionalData,
			projects,
			UID,
			enhanceData,
			baseURL;

		localforage.getItem("activityCache", function (c) {
			tasks = c;

			localforage.getItem("baseURL", function (u) {
				baseURL = u.charAt(u.length - 1) === "/" ? u : u + "/";
				getAdditionalData();
			});

		});

		getAdditionalData = function () {

			localforage.getItem("projectCache", function (p) {
				projects = p;
			}).then(function () {

				localforage.getItem("user", function (u) {
					UID = u.UserID;
				}).then(filterTasks);

			});

		};

		filterTasks = function () {

			tasks = tasks.filter(function (task) {
				return task.EndDate && task.CanEdit && !task.HasChild && (task.TaskStatusID === 18 || task.TaskStatusID === 1);
			});

			enhanceData();

		};

		enhanceData = function () {

			XIGENTIMER.VIEWMODEL.taskList([]);

			$.each(tasks, function (i, t) {

				switch(t.PriorityID)
				{
				case 1:
					t.PriorityID = 4;
					break;
				case 2:
					t.PriorityID = 3;
					break;
				case 3:
					t.PriorityID = 2;
					break;
				case 4:
					t.PriorityID = 1;
					break;
				}

				t.TaskURL = baseURL + "TaskDetails.aspx?ID=" + t.TaskID;
				t.ProjectURL = baseURL + "ProjectDetails.aspx?ID=" + t.ProjectID;
				t.DueDate = moment(t.EndDate, "YYYY-MM-DD/HH:mm:ss.SS").startOf('day').add(17, 'h').add(30, 'm').fromNow();
				t.moment = moment(t.EndDate, "YYYY-MM-DD/HH:mm:ss.SS").startOf('day').add(17, 'h').add(30, 'm');

				t.ProjectName = projects.filter(function (proj) {
					return proj.ProjectID === t.ProjectID;
				})[0].Name;

			});

			tasks = tasks.sort(function (a, b) {

				if (b.PriorityID === a.PriorityID) {
					return +b.moment - +a.moment;
				}

				return b.PriorityID - a.PriorityID;
			});

			$.each(tasks, function () {
				XIGENTIMER.VIEWMODEL.taskList.push(this);
			});

		};

	};

}(XIGENTIMER));