$(function () {

	"use strict";

	var avatarURL = "http://projectsvm.xigen.co.uk/ImagePage.aspx?t=0",
		defaultText,
		submit = $(".login [type=submit]"),
		VIEWMODEL,
		sidebarFilter;

	// Foundation
	$(document).foundation();

	// Handle logins
	function authorize (authToken, username) {

		XIGENTIMER.API.authorizeUser(authToken, username, function (user) {

			if (user) {
			
				localforage.setItem("user", user);

				$("[data-avatar]").find("img").remove();
				$("[data-avatar]").prepend("<img src='" + avatarURL  + "&h=" + user.AvatarHash + "&id=" + user.UserID + "'/>");

				XIGENTIMER.updateProjectList(function () {
					if (!sidebarFilter) {
						sidebarFilter = new XIGENTIMER.ProjectFilter($(".side-nav"), $(".sidebar-filter-wrap input"));
					
						setInterval(function () {
							XIGENTIMER.updateProjectList(function (wasOpen) {
								console.log("Refreshed...");
								sidebarFilter.refresh(wasOpen);
							});
						}, 600000);
					}
				});
				VIEWMODEL.isLoggedOut(false);
				VIEWMODEL.isLoggedIn(true);

			} else {

				VIEWMODEL.isLoggedOut(true);

				submit.text("Incorrect login, try again! :)")
					.addClass("warning")
					.removeClass("info");

				setTimeout(function () {
					submit.text(defaultText)
					.addClass("info")
					.removeClass("warning");
				}, 3000);

			}

		});

	}

	// Login Form
	XIGENTIMER.loginForm = function () {

		var that = this;

		this.isLoggedIn = ko.observable(false);
		this.isLoggedOut = ko.observable(false);
		this.selectedProject = ko.observable(false);
		this.isTiming = ko.observable(false);
		this.activityDesc = ko.observable("");

		// Used to force update
		this.dummy = ko.observable();

		this.hasProjectSelected = ko.computed(function () {
			return !! that.selectedProject();
		});

		this.canEdit = ko.computed(function () {
			return !that.isTiming();
		});

		this.canSendTime = ko.computed(function () {

			// Put this here, so it is subscribed
			that.dummy();

			return !!that.activityDesc() && !that.isTiming() && XIGENTIMER.TIMER.getTime() > 0 && !!that.selectedProject();

		});

		// Update the dummy function so that canSendTime will recompute
		this.recalcCanSend = function () {
			that.dummy.notifySubscribers();
		};

		localforage.getItem("authToken", function (token) {

			if (token) {

				localforage.getItem("userName", function (user) {

					if (user && token) {
						authorize(token, user);
					}

				});

			};

		});
		
		// Login
		$("[data-login]").on("submit", function (e) {

			e.preventDefault();

			var password = $("[name=password]", this).val(),
				user = $("[name=user]", this).val(),
				authToken;
				
			defaultText = submit.text();

			authToken = "Basic " + new Buffer(user + ":" + password).toString('base64');

			localforage.setItem("authToken", authToken);
			localforage.setItem("userName", user);

			submit.text("Logging in...");

			authorize(authToken, user);

		});

		// Logout
		$("[data-logout]").on("click", function (e) {

			e.preventDefault();

			localforage.setItem("authToken", null);
			localforage.setItem("userName", null);

			$("[data-login]")[0].reset();
			VIEWMODEL.isLoggedOut(true);
			VIEWMODEL.isLoggedIn(false);
			submit.text(defaultText);

		});

	};

	VIEWMODEL = new XIGENTIMER.loginForm();
	ko.applyBindings(VIEWMODEL);
	XIGENTIMER.VIEWMODEL = VIEWMODEL;

	$(".do-reset").on("click", function () {
		XIGENTIMER.reset()
	});

});