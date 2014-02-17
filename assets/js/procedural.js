$(function () {

	"use strict";

	var avatarURL = "http://projects.xigen.co.uk/ImagePage.aspx?t=0",
		timer = $(".timer").FlipClock({
			autoStart: false
		}),
		isTiming = false,
		defaultText,
		submit = $(".login [type=submit]"),
		VIEWMODEL;

	// Foundation
	$(document).foundation();

	// Handle logins
	function authorize (authToken, username) {

		console.log("Authorizing (level 1) with " + authToken);
		console.log("Authorizing (level 1) with user " + username);

		XIGENTIMER.API.authorizeUser(authToken, username, function (user) {

			if (user) {
			
				localforage.setItem("user", user);

				$("[data-avatar]").find("img").remove();
				$("[data-avatar]").prepend("<img src='" + avatarURL  + "&h=" + user.AvatarHash + "&id=" + user.UserID + "'/>");

				drawProjects();
				VIEWMODEL.isLoggedOut(false);
				VIEWMODEL.isLoggedIn(true);

			} else {

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

	function drawActivityList(data) {

		var ul = $(document.createElement("ul"));

		$.each(data, function () {

			ul.append("<li data-id='" + this.TaskID + "'><a href='#'>" + this.Name + "</a></li>");

		});

		return ul;

	}

	function drawProjects () {

		XIGENTIMER.API.getProjects(function (projects) {

			var sidebar = $(".side-nav"),
				frag = document.createDocumentFragment(),
				newLI,
				newUL,
				li;

			sidebar.empty();

			console.log(projects);

			$.each(projects.filter(function (i) {
				return i.Activities.length > 0;
			}), function (i, proj) {

				newLI = $(document.createElement("li"));

				newLI.append("<span>" + proj.Name + "</span>");

				if (proj.Activities && proj.Activities.length > 0) {

					newUL = $(document.createElement("ul"));

					$.each(proj.Activities.filter(function (i) {
						return !i.isHidden && i.Progress < 100;
					}), function (i, act) {

						console.log(act);

						if (!act.Activities) {
							newUL.append("<li data-id='" + act.TaskID + "'><a href='#'>" + act.Name + "</a></li>");
						} else {
							li = $("<li data-id='" + act.TaskID + "'><span>" + act.Name + "</span></li>");
							li.append(drawActivityList(act.Activities));
							newUL.append(li);
						}

					});

					newLI.append(newUL);

				}

				frag.appendChild(newLI[0]);

			});

			sidebar[0].appendChild(frag);
			collapseMenu();

		});

	}

	// Login Form
	XIGENTIMER.loginForm = function () {

		var that = this;

		this.isLoggedIn = ko.observable(false);
		this.isLoggedOut = ko.observable(true);

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

	}

	VIEWMODEL = new XIGENTIMER.loginForm();

	ko.applyBindings(VIEWMODEL);

	// Timer start/pause
	$(".do-timestart").on("click", function () {

		if (isTiming) {

			isTiming = false;
			$(".do-timestart").text("Start (Timer Paused)");
			timer.stop();
			console.log(timer.getTime());

			if (timer.getTime().time > 0) {
				$(".do-send").removeAttr("disabled");
			} else {
				$(".do-send").attr("disabled", "disabled");
			}

		} else {

			isTiming = true;
			$(".do-timestart").addClass("alert").removeClass("success");
			$(".do-send").attr("disabled", "disabled");
			$(".do-timestart").text("Pause");
			timer.start();

		}

	});

	// Collapsey bits
	function collapseMenu () {
		$(".side-nav li ul").hide();

		$(".side-nav li").each(function () {

			$(this).children("span").on("click", function () {

				$(this).toggleClass("is-open");

				$(this).parent("li").children("ul").toggle();

			});

		});

		$(".side-nav li a").each(function () {

			var bc = $(".breadcrumbs"),
				path = [];

			$(this).on("click", function () {

				path.push($(this).text());

				$(this).parents("li").each(function () {
					path.push($(this).find("span").first().text());
				});

				path = path.filter(function (step) {
					return step !== "";
				}).reverse();

				bc.empty();

				$(path).each(function (i) {

					if (i !== path.length - 1) {
						bc.append("<li class='unavailable'><a href='#'>" + this + "</a></li>");
					} else {
						bc.append("<li class='current'><a href='#'>" + this + "</a></li>");
					}

				});

			});

		});
	}

});