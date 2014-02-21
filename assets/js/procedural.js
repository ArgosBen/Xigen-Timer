/* globals Pikaday */
$(function () {

	"use strict";

	var avatarURL = "http://projectsvm.xigen.co.uk/ImagePage.aspx?t=0",
		defaultText,
		submit = $(".login [type=submit]"),
		datepickers= [],
		picker,
		VIEWMODEL,
		sidebarFilter;

	// Foundation
	$(document).foundation();

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

	// Initialise the datepickers
	XIGENTIMER.updateDatePickers();

	// Logout button
	$("[data-logout]").on("click", function (e) {
		e.preventDefault();
		localforage.setItem("userToken", null);
		localforage.setItem("userName", null);
		localforage.setItem("baseURL", null);
		XIGENTIMER.reset();
		XIGENTIMER.VIEWMODEL.reset(true);
	});

	// Login form submit
	$("[data-login]").on("submit", function (e) {

		e.preventDefault();

		var password = $("[name=password]", this).val(),
			user = $("[name=user]", this).val(),
			baseURL = $("[name=baseURL]", this).val(),
			authToken;
			
		defaultText = submit.text();

		submit.text("Logging in...");

		localforage.setItem("baseURL", baseURL)
			.then(XIGENTIMER.authoriseUser(user, password, function (user, token) {

			console.log(user, token);

			if (user) {
				submit.text(defaultText);
				localforage.setItem("user", user);
				localforage.setItem("userToken", token);
				localforage.setItem("userName", user.Login);
				localforage.setItem("baseURL", baseURL);

				XIGENTIMER.VIEWMODEL.isLoggedIn(true);
				XIGENTIMER.drawProjects();
			} else {
				submit.text("Incorrect login, try again :)");
			}

		}));

	});

	// Login if we have a token
	localforage.getItem("userToken", function (u) {
		if (u) {
			XIGENTIMER.authoriseUser(function () {
				XIGENTIMER.VIEWMODEL.isLoggedIn(true);
				XIGENTIMER.drawProjects();
			});
		}
	});

	// Reset Button
	$(".do-reset").on("click", function () {
		XIGENTIMER.reset();
	});

	// View online button
	$(".do-viewonline").on("click", function () {
		localforage.getItem("baseURL", function (u) {
			u = u.replace("/rest/v1/", "");
			XIGENTIMER.launchExternal(u + "/TaskDetails.aspx?ID=" + XIGENTIMER.VIEWMODEL.selectedProject());
		});
	});

	// External links
	$("body").on("click", "a", function (e) {
		if ($(this).attr("target") === "_system") {
			e.preventDefault();
			XIGENTIMER.launchExternal($(this).attr("href"));
		}
	});

	// breadcrumbs
	XIGENTIMER.BREADCRUMB_CONTAINER = $(".breadcrumbs");
	XIGENTIMER.BREADCRUMB_EMPTY= $(".breadcrumbs").contents();

	// Edit timelog button
	$(".time-table").on("click", ".button", function () {
		XIGENTIMER.editTimeLog($(this).parents("tr").attr("data-id"), this);
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

});