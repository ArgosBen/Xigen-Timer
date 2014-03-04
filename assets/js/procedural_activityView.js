$(function () {

	"use strict";

	var gui = require('nw.gui'),
		win = gui.Window.get(),
		qs = window.location.search.replace('?', ''),
		activityID = parseInt(qs.split("=")[1], 10),
		os = require('os'),
		activities,
		baseURL,
		getMessages,
		act,
		MiniViewModel,
		addMessage,
		defaultText,
		loaded,
		user;

	MiniViewModel = function () {

		this.newMessage = ko.observable();

		this.messages = ko.observableArray();

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

	localforage.getItem("activityCache", function (c) {

		activities = c;
		act = activities.filter(function (act) {
			return act.TaskID === activityID;
		})[0];

		win.title = act.Name;

		$(".activity-content").html(act.Description);

		$(".content-wrap a").each(function () {
			$(this).attr("target", "_system");
		});

		$("li.name").addClass("wide");
		$("li.name h1").append("<a href='#'>" + act.Name + "</a>");

	});

	localforage.getItem("baseURL", function (u) {

		baseURL = u;

		$(".do-viewonline").attr({
			"href" : u + "/TaskDetails.aspx?ID=" + activityID,
			"target" : "_system"
		}).removeAttr("disabled");

		getMessages();
	});

	$(".do-refresh").on("click", function () {
		$(this).addClass("is-refreshing").attr("disabled", "disabled");
		getMessages(function () {
			$(".do-refresh").removeClass("is-refreshing").removeAttr("disabled");
		});
	});

	// Get Messages
	getMessages = function (callback) {
		XIGENTIMER.API.base("GET", "activities/" + activityID + "/messages/", {}, function (success, data, unfilteredData) {

			loaded = 0;

			console.log(unfilteredData);

			data = unfilteredData.sort(function (a, b) {
				return (+moment(a.PostDate, "YYYY-MM-DD/HH:mm:ss.SS")) - (+moment(b.PostDate, "YYYY-MM-DD/HH:mm:ss.SS"));
			});

			VM.messages([]);

			if (data.length === 0) {
				if (typeof callback === "function") {
					callback();
				}
				return false;
			}

			$.each(data.reverse(), function (i, message) {

				localforage.getItem("userCache", function (u) {

					user = u.filter(function (user) {
						return user.UserID === message.UserID;
					})[0];

					// Avatar
					message.AvatarURL = baseURL + "/ImagePage.aspx?t=0&h=" + user.AvatarHash + "&id=" + message.UserID;

					// Name
					message.UserName = user.Name;

					// Time Since
					message.TimeSince = moment(message.PostDate, "YYYY-MM-DD/HH:mm:ss.SS").fromNow();

					message.MessageText = message.MessageText ? message.MessageText : "<span>&lt;No Message&gt;</span>"

					loaded += 1;

					if (loaded === data.length) {
						VM.messages(data);

						if (typeof callback === "function") {
							callback();
						}
					}

				});

			});

		});
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
					getMessages();

				} else {

					$(triggerEl).text("Error :(").removeAttr("disabled").removeClass("success").addClass("alert");

					setTimeout(function () {
						$(triggerEl).text(defaultText).removeClass("alert").addClass("success");
					}, 1500);

				}

			});
		};

	};

	// Copy patse implementation
	if (VM.notOSX) {
		var contextMenu = new gui.Menu(),
			linkMenu = new gui.Menu(),
			clipboard = gui.Clipboard.get(),
			copy = new gui.MenuItem({
				type: "normal",
				label: "Copy",
				click: function () {
					if (window.getSelection().toString()) {
						clipboard.set(window.getSelection().toString());
					}
				}
			}),
			copyLink = new gui.MenuItem({
				type: "normal",
				label: "Copy URL"
			});

		linkMenu.append(copy);
		linkMenu.append(copyLink);
		contextMenu.append(copy);

		$(".activity-content, .message_container").on("contextmenu", function (e) {

			if (e.target.tagName !== "A" && !$(e.target).parents("a").length) {
				console.log(e.target);
				contextMenu.popup(e.originalEvent.x, e.originalEvent.y);
			} else {

				linkMenu.items[1].click = function () {
					clipboard.set($(e.target).closest("a").attr("href"));
				};

				linkMenu.popup(e.originalEvent.x, e.originalEvent.y);
			}

		});

		$(document).on("keyCombo", function (e, data) {

			if (data.combo === "VIEW" && document.activeElement.tagName === "TEXTAREA") {
				$(document.activeElement).val($(document.activeElement).val() + clipboard.get('text'));
			}

		});

	};

});