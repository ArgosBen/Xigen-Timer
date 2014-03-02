(function (timer) {

	"use strict";

	var main,
		projects;

	timer.drawTaskList = function () {

		main();

	};

	main = function () {

		var tasks,
			baseTasks,
			filterTasks,
			getAdditionalData,
			UID,
			enhanceData,
			baseURL;

		localforage.getItem("activityCache", function (c) {
			tasks = c;
			baseTasks = c;

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
				return task.CanEdit && !task.HasChild;
			});

			if (timer.VIEWMODEL.showReviewItems()) {
				tasks = tasks.filter(function (task) {
					return task.TaskStatusID === 18 || task.TaskStatusID === 1 || task.TaskStatusID === 4;
				});
			} else {
				tasks = tasks.filter(function (task) {
					return task.TaskStatusID === 1 || task.TaskStatusID === 4;
				});
			}

			if (!timer.VIEWMODEL.showInfiniteItems()) {
				tasks = tasks.filter(function (task) {
					return task.EndDate;
				});
			}

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
				t.DueDate = t.EndDate ? moment(t.EndDate, "YYYY-MM-DD/HH:mm:ss.SS").startOf('day').add(17, 'h').add(30, 'm').fromNow() : "--";
				t.moment = t.EndDate ? moment(t.EndDate, "YYYY-MM-DD/HH:mm:ss.SS").startOf('day').add(17, 'h').add(30, 'm') : "--";
				t.daysDifference = typeof t.moment !== "string" ? t.moment.diff(moment(), 'days') : null;

				t.EstimatedHours = t.EstimatedHours ? parseFloat(t.EstimatedHours).toFixed(2) : null;

				t.ProjectName = projects.filter(function (proj) {
					return proj.ProjectID === t.ProjectID;
				})[0].Name;

			});

			tasks = tasks.sort(function (a, b) {
				if (b.PriorityID === a.PriorityID) {
					return +a.moment - +b.moment;
				}
				return b.PriorityID - a.PriorityID;
			});

			$.each(tasks, function () {
				XIGENTIMER.VIEWMODEL.taskList.push(this);
			});

		};

	};

	timer.selectTask = function (trigger) {

		console.log("SelectingTask");

		if (timer.VIEWMODEL.activityDesc() || timer.TIMER.getTime().time > 1) {
			if (!confirm("There is time in the timer that hasn't been sent yet, or the timer is running. Are you sure you want to load this task?")) {
				return false;
			}
		}

		var task,
			targetID = parseInt($(trigger).parents("tr").attr("data-id"), 10),
			ProjectName;

		localforage.getItem("activityCache", function (c) {
			task = c.filter(function (task) {
				return task.TaskID === targetID;
			})[0];

			ProjectName = projects.filter(function (proj) {
				return proj.ProjectID === task.ProjectID;
			})[0].Name;

			timer.reset();
			timer.TIMER.stop();

			timer.STATE.restore({
				"TaskName" : task.Name,
				"Breadcrumb" : ProjectName + " » " + task.Name,
				"TaskID" : task.TaskID,
				"TaskType" : task.TaskTypeID,
				"TimeLogged" : [0, 0],
				"Desc" : "",
				"Billable" : true,
				"ForReview" : false
			});

			$(".do-timestart").trigger("click");

		});

	};

}(XIGENTIMER));