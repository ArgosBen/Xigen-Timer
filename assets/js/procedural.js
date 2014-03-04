/* globals Pikaday */
$(function () {

	"use strict";

	var avatarURL = "http://projectsvm.xigen.co.uk/ImagePage.aspx?t=0",
		defaultText,
		gui = require('nw.gui'),
		submit = $(".login [type=submit]"),
		datepickers= [],
		picker,
		failFn,
		VIEWMODEL,
		sidebarFilter;

	// Foundation
	$(document).foundation();

	// Hide the login form
	$(".login").hide();

	$(".datepicker").each(function () {
		picker = new Pikaday({
			field: this,
			firstDay: 1,
			defaultDate: new Date(),
			setDefaultDate: true,
			maxDate: new Date(),
			format: "D MMM YYYY",
			onSelect: function () {
				XIGENTIMER.updateDatePickers();
			}
		});
		$(this).data('picker', picker);
		datepickers.push(picker);
	});

	// Logout button
	$("[data-logout]").on("click", function (e) {
		e.preventDefault();
		localforage.setItem("userToken", null);
		localforage.setItem("userName", null);
		localforage.setItem("baseURL", null);
		localforage.setItem("user", null);
		localforage.setItem("savedStates", null);
		XIGENTIMER.reset();
		XIGENTIMER.VIEWMODEL.reset(true);
		$(".login").fadeIn(200);
	});

	// Login fail function
	failFn = function () {
		submit.text("Incorrect login, try again :)");
		submit.addClass("alert");

		setTimeout(function () {
			submit.text(defaultText).removeClass("alert");
		}, 1500);
	};

	// Login form submit
	$("[data-login]").on("submit", function (e) {

		e.preventDefault();

		var password = $("[name=password]", this).val(),
			user = $("[name=user]", this).val(),
			baseURL = $("[name=baseURL]", this).val(),
			authToken;
			
		defaultText = submit.text();

		submit.text("Logging in...");

		if (user && password && baseURL) {
			localforage.setItem("baseURL", baseURL)
				.then(XIGENTIMER.authoriseUser(user, password, function (user, token) {

				if (user) {

					submit.text(defaultText);
					localforage.setItem("userToken", token);
					localforage.setItem("userName", user.Login);
					localforage.setItem("baseURL", baseURL);

					XIGENTIMER.VIEWMODEL.isLoggedIn(true);

					localforage.setItem("user", user).then(function () {
						XIGENTIMER.VIEWMODEL.updateFromFilters(function () {
							XIGENTIMER.updateDatePickers();
						});

						// Check for a connection
						XIGENTIMER.API.pulse();

						// Draw the task list
						XIGENTIMER.drawTaskList();

						// Check every 30 seconds
						setTimeout(function () {
							XIGENTIMER.API.pulse();
						}, 30000);
					});
					
				} else {
					failFn();
				}

			}));
		} else {
			failFn();
		}

	});

	// Login if we have a token
	localforage.getItem("userToken", function (u) {
		localforage.getItem("baseURL", function (b) {
			if (u && b) {
				XIGENTIMER.authoriseUser(function () {
					XIGENTIMER.VIEWMODEL.isLoggedIn(true);
					XIGENTIMER.VIEWMODEL.updateFromFilters(function () {
						XIGENTIMER.updateDatePickers();
					});
					XIGENTIMER.API.pulse();
					XIGENTIMER.drawTaskList();

					// Check every 30 seconds
					setTimeout(function () {
						XIGENTIMER.API.pulse();
					}, 30000);
				});
			} else {
				$(".login").fadeIn(200);
			}
		});
	});

	// Reset Button
	$(".do-reset").on("click", function () {
		XIGENTIMER.reset();
	});

	$(".time-table-tasks").on("click", ".do-selectTask", function () {
		XIGENTIMER.selectTask(this);
	});

	// View online button
	$(".do-viewonline").on("click", function () {
		if ($(this).attr("disabled")) { return false; }

		gui.Window.open('viewActivity.html?activityID=' + $(this).attr("data-id"), {
			frame: false,
			title: $(".breadcrumb li").last().text(),
			width: 850,
			max_width: 850,
			height: 450,
			max_height: 450,
			min_width: 800,
			min_height: 400,
			toolbar: false
		});
	});

	// External links
	$("body").on("click", "a", function (e) {
		if ($(this).attr("target") === "_system") {
			e.preventDefault();
			XIGENTIMER.launchExternal($(this).attr("href"));
		}

		if ($(this).attr("target") === "_viewProject") {
			e.preventDefault();

			var title = $(this).text();
			
			gui.Window.open('viewActivity.html?activityID=' + $(this).attr("data-id"), {
				frame: false,
				title: title,
				width: 850,
				max_width: 850,
				height: 450,
				max_height: 450,
				min_width: 800,
				min_height: 400,
				toolbar: false
			});

		}
	});

	// breadcrumbs
	XIGENTIMER.BREADCRUMB_CONTAINER = $(".breadcrumbs");
	XIGENTIMER.BREADCRUMB_EMPTY= $(".breadcrumbs").contents();

	// Edit timelog button
	$(".time-table").on("click", ".do-editTimeLog", function () {
		XIGENTIMER.editTimeLog($(this).parents("tr").attr("data-id"), this);
	});

	// Key bindings
	$("#desc, .filter-text").on("keydown", function (e) {
		if (e.which === 32 || e.keyCode === 32) {
			e.stopPropagation();
		}
	});

	$(document).on("keyCombo", function (e, data) {

		var combo = data.combo,
			active;

		if (combo === "SUBMIT") {
			XIGENTIMER.sendTime();
		}

		if (combo === "REFRESH" || combo === "REFRESH_ALT") {
			XIGENTIMER.VIEWMODEL.updateFromFilters();
		}

		if (combo === "SETTINGS" || combo === "SETTINGS_ALT") {
			$("#settingsMenu").foundation("reveal", "open");
		}

		if (combo === "EDIT") {
			if (!XIGENTIMER.VIEWMODEL.isTiming()) {
				$("#customTime").foundation("reveal", "open");
			}
		}

		if (combo === "FIND") {
			$(".filter-text").focus();
		}

		if (combo === "PLAYPAUSE") {
			$(".do-timestart").trigger("click");
		}

		if (combo === "LOGS") {
			XIGENTIMER.VIEWMODEL.selectTiming();
		}

		if (combo === "TIMER") {
			XIGENTIMER.VIEWMODEL.selectOverview();
		}

		if (combo === "DESC") {
			$("#desc").focus();
		}

		if (combo === "LOGOUT") {
			active = $(document.activeElement);
			if (active[0].className === "filter-text") {
				$(".do-clearfilter").trigger("click");
			}
		}

		if (combo === "HELP") {
			$("#shortcutMenu").foundation("reveal", "open");
		}

		if (combo === "VIEW") {
			if (document.activeElement.tagName !== "TEXTAREA") {
				$(".do-viewonline").trigger("click");
			} else {
				$(document.activeElement).val($(document.activeElement).val() + gui.Clipboard.get().get('text'));
			}
		}

	});

	// Make the edit modal focus the inputs itself wehn it's opened
	$(document).on('open', '[data-reveal]', function () {
		var modal = $(this);
		if (modal[0].id === "customTime") {
			setTimeout(function () {
				modal.find("input").first().focus();
			}, 200);
		}
	});

	// Icons
	$(".icon-min").on("click", function () {
		XIGENTIMER.minimize();
	});

	$(".icon-hide").on("click", function () {
		XIGENTIMER.goToTray();
	});

	$(".icon-close").on("click", function () {
		XIGENTIMER.close();
	});

	// Refresh Button
	$(".do-refresh").on("click", function () {

		XIGENTIMER.VIEWMODEL.updateFromFilters(function () {
			$(".do-refresh").removeClass("is-refreshing").removeAttr("disabled");
		});

		XIGENTIMER.updateDatePickers();

	});

});