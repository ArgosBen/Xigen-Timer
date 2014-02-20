if (typeof XIGENTIMER !== "object") {
	XIGENTIMER = {};
}

(function (timer) {

	"use strict";

	var RESTClient = require('node-rest-client').Client,
		baseURL,
		APIBaseFunction,
		avatarURL = "http://projectsvm.xigen.co.uk/ImagePage.aspx?t=0",
		client = new RESTClient(),
		config = {
			userID : 0,
			email: "matt@xigen.co.uk"
		};

	timer.API = {

		base: function (method, path, data, callback) {

			var getUserID,
				userToken,
				getData,
				getAuthToken,
				userID,
				userName,
				returnedData,
				request = {};

			getUserID = function () {
				localforage.getItem("user", function (user) {
					
					userID = user.UserID;
					userName = user.Name;

					request.headers = {
						"Authorization" : userToken,
						"Content-Type" : "application/json"
					};

					if (data) {
						request.data = typeof data === "object" ? JSON.stringify(data) : data;
					}

				}).then(getData);
			};

			getData = function () {

				console.log("getting " + baseURL + path);

				client[method.toLowerCase()](baseURL + path,
				request,
				function(data, response) {

					data = JSON.parse(data);

					if (data[0].UserID) {
						returnedData = data.filter(function (item) {
							return item.UserID === userID;
						});
					} else if (data[0].Members) {
						returnedData = data.filter(function (item) {
							return item.Members.split("\n").indexOf(userName) > -1;
						});
					} else {
						returnedData = data.filter(function (item) {
							return item.CanCreateTimeEntries;
						});
					}

					if (typeof callback === "function") {

						if (response.statusCode === 200 || response.statusCode === 201) {
							callback(true, returnedData);
						} else {
							callback(false);
						}

					}

				});

			};

			getAuthToken = function () {
				localforage.getItem("authToken", function (token) {
					userToken = token;
				}).then(getUserID);
			};

			if (baseURL) {
				getAuthToken();
			} else {
				localforage.getItem("baseURL", function (b) {
					baseURL = b;
				}).then(getAuthToken);
			}

		},

		authorizeUser: function (auth, login, callback) {

			var ret = false,
				doAuth;

			// Get the base URL and auth, 
			// or if we don't have baseURL then return false
			localforage.getItem("baseURL", function (b) {
				baseURL = b;
				if (b) {
					doAuth();
				} else {
					callback(false);
				}
			});

			doAuth = function () {

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
			}

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
				makeRequest,
				taskTypeID,
				getTaskType,
				ret;

			getTaskType = function () {

				localforage.getItem("activityCache", function (activities) {

					ret = activities.filter(function (a) {
						return a.TaskID === taskID;
					})[0];

					taskTypeID = ret.TaskTypeID;

				}).then(makeRequest);

			}

			makeRequest = function () {

				client.put(baseURL + "activities/" + taskID,
				{
					headers: {
						"Authorization" : userToken,
						"Content-Type" : "application/json"
					},
					data: JSON.stringify({
						"EntityBaseID" : taskID,
						"TaskStatusID" : taskTypeID === 1 ? 18 : 8
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

			}).then(getTaskType);

		},

		updateTimeLog: function (logID, duration, description, callback) {

			var getUserToken,
				userToken,
				makeRequest,
				getOldLog,
				oldLog,
				diff = false;

			getOldLog = function () {

				client.get(baseURL + "timelogs/" + logID,
				{
					headers: {
						"Authorization" : userToken,
						"Content-Type" : "application/json"
					}
				},
				function (data) {

					oldLog = JSON.parse(data);

					if (oldLog.Duration !== duration) {
						diff = true;
						oldLog.Duration = parseFloat(duration);
					}
					
					if (oldLog.Description !== description) {
						diff = true;
						oldLog.Description = description;
					}

					delete oldLog.LastModificationDate;

					if (diff) {
						makeRequest();
					} else {
						callback(true);
					}
				});

			};

			makeRequest = function () {

				client.put(baseURL + "timelogs/" + logID,
				{
					headers: {
						"Authorization" : userToken,
						"Content-Type" : "application/json"
					},
					data: JSON.stringify(oldLog)
				},
				function (data, response) {

					if (typeof callback === "function") {

						callback(response.statusCode === 200);

					}

				});

			};

			localforage.getItem("authToken", function (token) {

				userToken = token;

			}).then(getOldLog);

		}

	};

}(XIGENTIMER));