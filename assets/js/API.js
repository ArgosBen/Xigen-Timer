if (typeof XIGENTIMER !== "object") {
	XIGENTIMER = {};
}

(function (timer) {

	"use strict";

	var RESTClient = require('node-rest-client').Client,
		baseURL = "http://projects.xigen.co.uk/rest/v1/",
		avatarURL = "http://projects.xigen.co.uk/ImagePage.aspx?t=0",
		client = new RESTClient(),
		config = {
			userID : 0,
			email: "matt@xigen.co.uk"
		}

	timer.API = {

		authorizeUser: function (auth, login, callback) {

			console.log("Authorizing (level 2) with " + auth);
			console.log("Authorizing (level 2) with user " + login);

			var ret = false;

			client.get(baseURL + "users",
			{
				headers: {
					"Authorization" : auth,
					"Content-Type" : "application/json"
				}
			},
			function(data) {
				
				if (data) {
					$.each(JSON.parse(data), function (i, user) {

						if (user.Login.toLowerCase() === login.toLowerCase()) {
	
							localforage.setItem("user", user);

							ret = user;
							return false;
						}

					});

					if (typeof callback === "function") {
						callback(ret);
					}
				} else {
					if (typeof callback === "function") {
						callback(false);
					}
				}

			});

		},

		getProjects: function (callback) {

			var projectCount,
				loaded = 0;

			localforage.getItem("authToken", function (userToken) {

				client.get(baseURL + "projects",
				{
					headers: {
						"Authorization" : userToken,
						"Content-Type" : "application/json"
					}
				},
				function(data, response) {

					localforage.getItem("user", function (user) {
					
						var projects = data ? JSON.parse(data) : [],
							myProjects = projects.filter(function (proj) {

								return proj.Members.split("\n").indexOf(user.Name) > -1;

							});

						projectCount = myProjects.length;

						$(myProjects).each(function (i) {

							var proj = this;

							client.get(baseURL + "projects/" + proj.ProjectID + "/activities/" , {
								headers: {
									"Authorization" : userToken,
									"Content-Type" : "application/json"
								}
							}, function (activities) {
								myProjects[i].Activities = JSON.parse(activities);
								loaded += 1;

								if (typeof callback === "function" && loaded === projectCount) {

									callback(myProjects);

								}
							});

						});
					});

				});

			});

		},

		getActivities: function (callback) {

			localforage.getItem("authToken", function (token) {

				client.get(baseURL + "activities",
				{
					headers: {
						"Authorization" : token,
						"Content-Type" : "application/json"
					}
				},
				function(data, response) {

					console.log(JSON.parse(data));

					// localforage.getItem("user", function (user) {
					
					// var projects = data ? JSON.parse(data) : [],
					// 	myProjects = projects.filter(function (proj) {

					// 		return proj.Members.split("\n").indexOf(user.Name) > -1;

					// 	});

					// 	if (typeof callback === "function") {

					// 		callback(myProjects);

					// 	}

					// });

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

		}

	};

}(XIGENTIMER));