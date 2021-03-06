(function (timer) {

	"use strict";

	var main,
		projects;

	timer.drawTaskList = function () {

		main();

	};

	timer.drawManagedTaskList = function () {

		main(true);

	};

	main = function (management) {

		var tasks,
			baseTasks,
			filterTasks,
			getAdditionalData,
			UID,
			enhanceData,
			baseURL,
			targetCache = management ? "rawActivityCache" : "activityCache";

		localforage.getItem(targetCache, function (c) {
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

			if (!management) {
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
			} else {
				tasks = tasks.filter(function (task) {
					return task.CreatorID === UID;
				});
			}

			enhanceData();

		};

		enhanceData = function () {

			var complete = 0,
				finalTasks,
				current = XIGENTIMER.VIEWMODEL.taskList().length;

			finalTasks = function () {
				tasks = tasks.sort(function (a, b) {
					if (b.PriorityID === a.PriorityID) {
						return +a.moment - +b.moment;
					}
					return b.PriorityID - a.PriorityID;
				});

				if (!management) {
					XIGENTIMER.VIEWMODEL.taskList([]);
				} else {
					XIGENTIMER.VIEWMODEL.managedTaskList([]);
				}

				if (XIGENTIMER.activityCount !== undefined) {
					var diff = tasks.length - current;

					if (diff > 0) {
						XIGENTIMER.notify("Tasks Assigned", diff + " new. " + tasks.length + " total.");
					} else {
						XIGENTIMER.notify("Refreshed Tasks", "No new tasks assigned. " + tasks.length + " total.");
					}
				}

				if (!management) {
					$.each(tasks, function () {
						XIGENTIMER.VIEWMODEL.taskList.push(this);
					});
					XIGENTIMER.activityCount = XIGENTIMER.VIEWMODEL.taskList().length;
				} else {
					XIGENTIMER.VIEWMODEL.managedTaskList(tasks.filter(function (task) {
						
						var validIDs = [];
						if (XIGENTIMER.VIEWMODEL.managedShowOpen()) {
							validIDs.push(1);
						}

						if (XIGENTIMER.VIEWMODEL.managedShowReview()) {
							validIDs.push(18);
						}

						if (XIGENTIMER.VIEWMODEL.managedShowPending()) {
							validIDs.push(20);
						}
						
						return validIDs.indexOf(task.TaskStatusID) > -1;

					}));

				}

			};

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

				if (!management) {
					complete += 1;

					if (complete === tasks.length) {
						finalTasks();
					}

				} else {
					XIGENTIMER.API.getTimeForTask(t.TaskID, function (total) {
						t.TotalHours = total.toFixed(2);
						complete += 1;

						if (complete === tasks.length) {
							finalTasks();
						}
					});
				}

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