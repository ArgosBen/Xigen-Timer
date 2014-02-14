$(function () {

	"use strict";

	var baseURL = "http://projects.xigen.co.uk/rest/v1/",
		avatarURL = "http://projects.xigen.co.uk/ImagePage.aspx?t=0",
		API,
		RESTClient = require('node-rest-client').Client,
		client = new RESTClient(),
		config = {
			"email" : "matt@xigen.co.uk",
			"userID" : 0
		};

	$(document).foundation();

	API = {

		getCurrentUser: function () {

			client.get(baseURL + "users",
			{
				headers: {
					"Authorization" : "Basic bWF0dG06NmdyZWVuY2F0",
					"Content-Type" : "application/json"
				}
			},
			function(data, response) {
				
				$.each(JSON.parse(data), function (i, user) {

					if (user.EMail === config.email) {
						console.log(user);
						config.userID = user.UserID;
						config.name = user.Name;

						// $("body").append("<p>Logged in as " + user.Name + "</p>");
						$(".right .active a").prepend("<img src=" + avatarURL + "&h=" + user.AvatarHash + "&id=" + user.UserID + " />");

					}

				});

			});

		},

		getTimelogs: function () {

			client.get(baseURL + "timelogs",
			{
				headers: {
					"Authorization" : "Basic bWF0dG06NmdyZWVuY2F0",
					"Content-Type" : "application/json"
				}
			},
			function(data, response) {
				
				var myLogs = JSON.parse(data).filter(function (log) {

					return log.UserID === config.userID;

				});

				$.each(myLogs, function () {

					$("body").append("<p>" + this.Duration + " hours doing task: " + this.Description + "</p>");

				});

			});

		},

		getProjects: function () {

			client.get(baseURL + "projects",
			{
				headers: {
					"Authorization" : "Basic bWF0dG06NmdyZWVuY2F0",
					"Content-Type" : "application/json"
				}
			},
			function(data, response) {
				
				var projects = JSON.parse(data),
					myProjects = projects.filter(function (proj) {

						console.log(proj.Members.split("\n"), config.name);

						return proj.Members.split("\n").indexOf(config.name) > -1;

					});

					console.log(myProjects);

					$(".side-nav").empty();

					$.each(myProjects, function () {

						$(".side-nav").append("<li><a href='#'>" + this.Name + "</a></li>");

					});

			});

		}

	};

	window.API = API;

	API.getCurrentUser();

});