$(function () {

	"use strict";

	var gui = require('nw.gui'),
		win = gui.Window.get(),
		qs = window.location.search.replace('?', ''),
		activityID = parseInt(qs.split("=")[1], 10),
		os = require('os'),
		activities,
		baseURL,
		getUsers,
		act,
		MiniViewModel,
		VM,
		assigneeHandler,
		userCache,
		loadActivityDetails,
		getAssigness,
		getTimeLogs;

	MiniViewModel = function () {

		var that = this;

		this.timeLogs = ko.observableArray();

		this.possibleAssigness = ko.observableArray([]);

		this.users = ko.computed(function () {

			return that.possibleAssigness().filter(function (u) {
				return u.isAssigned();
			});

		});

		this.notOSX = !/darwin/.test(os.platform());

	};

	VM = new MiniViewModel();
	window.VM = VM;

	ko.applyBindings(VM);

	$(document).foundation();

	$(".icon-min").on("click", function () {
		win.minimize();
	});

	$(".icon-close").on("click", function () {
		win.close();
	});

	$("body").on("click", "a", function (e) {
		if ($(this).attr("target") === "_system") {
			e.preventDefault();
			XIGENTIMER.launchExternal($(this).attr("href"));
		}
	});

	$(document).on('close', '[data-reveal]', function () {

		var modal = $(this);

		if (modal[0].id === "addAssignees") {

			assigneeHandler.updateAssigness(VM.possibleAssigness(), function () {});

		}

	});

	// Get start and end dates
	loadActivityDetails = function () {
		localforage.getItem("rawActivityCache", function (c) {

			activities = c;
			act = activities.filter(function (act) {
				return act.TaskID === activityID;
			})[0];

			win.title = act.Name;

			$(".content-wrap a").each(function () {
				$(this).attr("target", "_system");
			});

			$("li.name").addClass("wide");
			$("li.name h1").append("<a href='#'>" + act.Name + "</a>");

			if ($("#endDate").data('picker')) {
				$("#endDate").data('picker').destroy();
				$("#startDate").data('picker').destroy();
			}

			var startDate = new Pikaday({
					field: $("#startDate")[0],
					firstDay: 1,
					defaultDate:  moment(act.StartDate, "YYYY-MM-DD/HH:mm:ss.SS").toDate(),
					setDefaultDate: true,
					format: "D MMM YYYY"
				}),
				endDate = new Pikaday({
					field: $("#endDate")[0],
					firstDay: 1,
					defaultDate:  moment(act.EndDate, "YYYY-MM-DD/HH:mm:ss.SS").toDate(),
					setDefaultDate: true,
					format: "D MMM YYYY"
				});

			$("#endDate").data('picker', endDate);
			$("#startDate").data('picker', startDate);

			$("#changeStatus").val(act.TaskStatusID);
			$("#changePriority").val(act.PriorityID);

			$("#Estimate").val(act.EstimatedHours ? act.EstimatedHours.toFixed(2) : "");

			getAssigness();
			getTimeLogs();

		});
	};

	getAssigness = function () {

		assigneeHandler = new XIGENTIMER.AssigneeGenerator(activityID, act.ProjectID, function (users) {

			VM.possibleAssigness(users);

		});

	};

	getTimeLogs = function () {
		localforage.getItem("timelogCache", function (tlc) {

			tlc = tlc.filter(function (log) {
				return log.TaskID === activityID;
			});

			$.each(tlc, function (i, log) {

				log.UserID = userCache.filter(function (u) {
					return u.UserID === log.UserID;
				})[0].Name;

				log.EntryDate = moment(log.EntryDate, "YYYY-MM-DD/HH:mm:ss.SS").format('LL');

				log.Duration = log.Duration.toFixed(2);

				for (var d = 0; d < 25; d += 1) {
					tlc.push(log);
				}

			});

			VM.timeLogs(tlc);

		});
	};

	loadActivityDetails();

	localforage.getItem("baseURL", function (u) {

		baseURL = u;

		$(".do-viewonline").attr({
			"href" : u + "/TaskDetails.aspx?ID=" + activityID,
			"target" : "_system"
		}).removeAttr("disabled");

	});

	$(".do-refresh").on("click", function () {

		var btn = $(this);

		btn.addClass("is-refreshing").attr("disabled", "disabled");
		
		XIGENTIMER.API.getHierachy(function () {
			loadActivityDetails();
			btn.removeClass("is-refreshing").removeAttr("disabled");
		});

		assigneeHandler.refresh(function (assignees) {
			VM.possibleAssigness(assignees);
		});

	});

	$(".assignee-list").on("click", "li a", function () {
		var target = $("[type=checkbox]", this);
		target.prop("checked") ? target.prop("checked", false) : target.prop("checked", true);
		target.trigger("change");
	});

	$(".assignee-list").on("change", "input", function (e) {

		e.preventDefault();

		var targetID = $(this).closest("li").attr("data-index");

		if ($(this).prop("checked")) {
			VM.possibleAssigness()[targetID].isAssigned(true);
		} else {
			VM.possibleAssigness()[targetID].isAssigned(false);
		}

	});

	$(".do-save").on("click", function (e) {

		var btn = $(this);

		$(this).text("Saving...").attr("disabled", "disabled");

		e.preventDefault();

		var data = {
			"TaskID" : activityID,
			"StartDate" : $("#startDate").val() ? $("#startDate").data("picker").getMoment().format("YYYY-MM-DDTHH:mm:ss.SS") : "0000-00-00T00:00:00.00",
			"EndDate" : $("#endDate").val() ? $("#endDate").data("picker").getMoment().format("YYYY-MM-DDTHH:mm:ss.SS") : null,
			"PriorityID" : parseInt($("#changePriority").val(), 10),
			"TaskStatusID" : parseInt($("#changeStatus").val(), 10),
			"EstimatedHours" : parseInt($("#Estimate").val(), 10).toFixed(2)
		};

		console.log(JSON.stringify(data));

		XIGENTIMER.API.base("PUT", "activities/" + activityID, data, function () {

			setTimeout(function () {
				XIGENTIMER.API.getHierachy(function () {
					btn.text("Save").removeAttr("disabled");
				});
			}, 200);

		});

	});

});