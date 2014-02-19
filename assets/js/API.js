if (typeof XIGENTIMER !== "object") {
	XIGENTIMER = {};
}

(function (timer) {

	"use strict";

	var RESTClient = require('node-rest-client').Client,
		baseURL = "http://projectsvm.xigen.co.uk/rest/v1/",
		avatarURL = "http://projectsvm.xigen.co.uk/ImagePage.aspx?t=0",
		client = new RESTClient(),
		config = {
			userID : 0,
			email: "matt@xigen.co.uk"
		}

	timer.API = {

		authorizeUser: function (auth, login, callback) {

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
				loaded = 0,
				allActivities = [];

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

						localforage.setItem("projectCache", projects);

						projectCount = myProjects.length;

						$(myProjects).each(function (i) {

							var proj = this;

							client.get(baseURL + "projects/" + proj.ProjectID + "/activities/" , {
								headers: {
									"Authorization" : userToken,
									"Content-Type" : "application/json"
								}
							}, function (activities) {
								
								var acts = JSON.parse(activities),
									parent,
									loopCounter = 0;

								loaded += 1;

								allActivities = allActivities.concat(acts);

								$.each(acts, function () {

									var that = this;

									if (this.ParentID) {

										parent = acts.filter(function (act) {
											return act.EntityBaseID === that.ParentID;
										})[0];

										if (!parent.Activities) {
											parent.Activities = [];
										}

										parent.Activities.push(that);

										that.isHidden = true;

									}

									loopCounter += 1;

								});

								myProjects[i].Activities = acts;

								if (loaded === projectCount) {
									localforage.setItem("activityCache", allActivities);
								}

								if (typeof callback === "function" && loaded === projectCount) {

									callback(myProjects);

								}
							});

						});
					});

				});

			});

		},

		getTimelogs: function (callback) {

			var userToken,
				userID,
				getUserToken,
				getLogs;

			getUserToken = function () {
				localforage.getItem("user", function (user) {
					userID = user.UserID;
				}).then(getLogs);
			};

			getLogs = function () {
				client.get(baseURL + "timelogs",
				{
					headers: {
						"Authorization" : userToken,
						"Content-Type" : "application/json"
					}
				},
				function(data, response) {
					
					var myLogs = JSON.parse(data).filter(function (log) {

						return log.UserID === userID;

					});

					if (typeof callback === "function") {

						callback(myLogs);

					}

				});
			};

			localforage.getItem("authToken", function (token) {

				userToken = token;

			}).then(getUserToken);

		},

		logTime: function (userID, taskID, duration, isBillable, description, callback) {

			var getUserToken,
				userToken,
				makeRequest,
				userData,
				date = new Date(),
				formattedDate;

			formattedDate = [
				date.getFullYear(),
				"-",
				date.getMonth().toString().length === 1 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1,
				"-",
				date.getDate().toString().length === 1 ? "0" + date.getDate() : date.getDate(),
				"T",
				date.getHours(),
				":",
				date.getMinutes().toString().length === 1 ? "0" + date.getMinutes() : date.getMinutes(),
				":",
				date.getSeconds().toString().length === 1 ? "0" + date.getSeconds() : date.getSeconds(),
			].join('');

			getUserToken = function () {
				localforage.getItem("user", function (user) {
					userData = user;
				}).then(makeRequest);
			};

			makeRequest = function () {

				client.post(baseURL + "timelogs",
				{
					headers: {
						"Authorization" : userToken,
						"Content-Type" : "application/json"
					},
					data: JSON.stringify({
						"UserID" : userData.UserID,
						"Duration" : duration,
						"TaskID" : taskID,
						"Description" : description,
						"Billable" : isBillable,
						"EntryDate" : formattedDate
					})
				},
				function (data, response) {

					if (typeof callback === "function") {

						callback(response.statusCode === 201);

					}

				});

			};

			localforage.getItem("authToken", function (token) {

				userToken = token;

			}).then(getUserToken);

		},

		markForReview: function (taskID, callback) {

			var getUserToken,
				userToken,
				makeRequest;

			makeRequest = function () {

				console.log(baseURL + "activities/" + taskID);

				client.put(baseURL + "activities/" + taskID,
				{
					headers: {
						"Authorization" : userToken,
						"Content-Type" : "application/json"
					},
					data: JSON.stringify({
						"EntityBaseID" : taskID,
						"TaskStatusID" : 18
					})
				},
				function (data, response) {

					if (typeof callback === "function") {

						callback(response.statusCode === 200);

					}

				});

			};

			localforage.getItem("authToken", function (token) {

				userToken = token;

			}).then(makeRequest);

		}

	};

}(XIGENTIMER));