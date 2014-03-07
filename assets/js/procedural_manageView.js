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
		users,
		act,
		MiniViewModel,
		addMessage,
		defaultText,
		loaded,
		userCache,
		getTimeLogs;

	MiniViewModel = function () {

		this.newMessage = ko.observable();

		this.users = ko.observableArray();

		this.timeLogs = ko.observableArray();

		this.notOSX = !/darwin/.test(os.platform());

	};

	var VM = new MiniViewModel();
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

	$("#addMessage .secondary").on("click", function () {
		$("#addMessage").foundation("reveal", "close");
	});

	$("#addMessage .success").on("click", function () {
		addMessage(this);
	});

	$(".message_send").on("click", function () {});

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

	});

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

	localforage.getItem("baseURL", function (u) {

		baseURL = u;

		$(".do-viewonline").attr({
			"href" : u + "/TaskDetails.aspx?ID=" + activityID,
			"target" : "_system"
		}).removeAttr("disabled");

		getUsers();
	});

	$(".do-refresh").on("click", function () {
		$(this).addClass("is-refreshing").attr("disabled", "disabled");
		getUsers(function () {
			$(".do-refresh").removeClass("is-refreshing").removeAttr("disabled");
		});
	});

	$(".do-save").on("click", function (e) {

		var btn = $(this);

		$(this).text("Saving...").attr("disabled", "disabled");

		e.preventDefault();

		var data = {
			"TaskID" : activityID,
			"StartDate" : $("#startDate").val() ? $("#startDate").data("picker").getMoment().format("YYYY-MM-DDTHH:mm:ss.SS") : null,
			"EndDate" : $("#endDate").val() ? $("#endDate").data("picker").getMoment().format("YYYY-MM-DDTHH:mm:ss.SS") : null,
			"PriorityID" : parseInt($("#changePriority").val(), 10),
			"TaskStatusID" : parseInt($("#changeStatus").val(), 10)
		};

		XIGENTIMER.API.base("PUT", "activities/" + activityID, data, function (success, response) {

			btn.text("Save").removeAttr("disabled");

		});

	});

	// Get Messages
	getUsers = function (callback) {

		var loaded = 0,
			assignees,
			userIDs = [],
			makeList;

		XIGENTIMER.API.base("GET", "activities/" + activityID + "/assignees/", {}, function (success, data, unfilteredData) {

			assignees = unfilteredData;

			$.each(unfilteredData, function () {

				XIGENTIMER.API.base("GET", "projects-members?$filter=ProjectMemberID eq " + this.ProjectMemberID, {}, function (success, data, unfilteredData) {
					loaded += 1;
					userIDs.push(data[0].UserID);

					if (loaded === assignees.length) {
						makeList();
					}
				});

			});
				
		});

		makeList = function () {

			localforage.getItem("userCache", function (u) {

				userCache = u;

				var users = u.filter(function (i) {
					return userIDs.indexOf(i.UserID) > -1;
				});

				localforage.getItem("baseURL", function (b) {

					$.each(users, function (index, user) {
						user.AvatarURL = b + "/ImagePage.aspx?t=0&h=" + user.AvatarHash + "&id=" + user.UserID;
					});

					VM.users(users);

					getTimeLogs();

				});

			});

		};
	};

	// Add message
	addMessage = function (triggerEl) {

		var makeRequest,
			userID;

		defaultText = defaultText ? defaultText : $(triggerEl).text();

		$(triggerEl).attr("disabled", "disabled").text("Adding...");

		localforage.getItem("user", function (u) {
			userID = u.UserID;
			makeRequest();
		});

		makeRequest = function () {
			XIGENTIMER.API.base("POST", "messages", {
				"UserID" : userID,
				"TaskID" : act.TaskID,
				"MessageText" : VM.newMessage(),
				"PostDate" : moment().format("YYYY-MM-DDTHH:mm:ss.SS")
			}, function (success) {

				if (success) {

					$(triggerEl).text(defaultText).removeAttr("disabled");
					$("#addMessage").foundation("reveal", "close");
					VM.newMessage("");
					getUsers();

				} else {

					$(triggerEl).text("Error :(").removeAttr("disabled").removeClass("success").addClass("alert");

					setTimeout(function () {
						$(triggerEl).text(defaultText).removeClass("alert").addClass("success");
					}, 1500);

				}

			});
		};

	};

});