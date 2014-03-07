if (typeof XIGENTIMER !== "object") {
	XIGENTIMER = {};
}

(function (timer) {

	"use strict";

	var baseURL,
		userName,
		APIBaseFunction,
		avatarURL = "http://projectsvm.xigen.co.uk/ImagePage.aspx?t=0",
		client = require('restler'),
		config = {
			userID : 0,
			email: "matt@xigen.co.uk"
		};

	timer.API = {

		base: function (method, path, data, callback) {

			var getUserID,
				userToken,
				getData,
				pureData,
				getAuthToken,
				userID,
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

					if (Object.keys(data) && Object.keys(data).length !== 0) {
						request.data = typeof data === "object" ? JSON.stringify(data) : data;
					}

				}).then(getData);
			};

			getData = function () {

				client[method.toLowerCase()](baseURL + path,
				request).on("complete", function(data, response) {

					if (!!data) {

						if (typeof data !== "object") {
							pureData = JSON.parse(data);
						} else {
							pureData = data;
						}

						if (typeof data !== "object") {
							data = JSON.parse(data);
						}

						if (!data.length) {
							data = [data];
						}

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

					}

					if (typeof callback === "function") {

						if (response.statusCode === 200 || response.statusCode === 201) {
							callback(true, returnedData, pureData);
						} else {
							callback(false);
							console.log(request.data, data);
						}

					}

				}).on("error", function (err) {

					alert("Network Error: " + JSON.stringify(err.request.options));

				});

			};

			getAuthToken = function () {
				localforage.getItem("userToken", function (token) {
					userToken = token;
				}).then(getUserID);
			};

			if (baseURL) {
				getAuthToken();
			} else {
				localforage.getItem("baseURL", function (b) {
					baseURL = b.indexOf("/rest/v1/") > -1 ? b : b + "/rest/v1/";
				}).then(getAuthToken);
			}

		},

		authoriseAPI: function (username, callback) {

			var userToken,
				getBaseURL,
				makeRequest;

			makeRequest = function () {
				client.get(baseURL + "users",
				{
					headers: {
						"Authorization" : userToken,
						"Content-Type" : "application/json",
						"Content-Length" : 2
					}
				}).on("complete", function (data) {

					if (!data) {
						callback(false);
						return false;
					}

					localforage.setItem("userCache", data);

					data = data.filter(function (u) {
						return u.Login === username;
					})[0];

					callback(true, data);

				});
			};

			getBaseURL = function () {

				if (userToken) {
					localforage.getItem("baseURL", function (b) {
						baseURL = b.indexOf("/rest/v1/") > -1 ? b : b + "/rest/v1/";
					}).then(makeRequest);
				} else {
					callback(false);
				}
			};

			localforage.getItem("userToken", function (token) {

				userToken = token;

			}).then(getBaseURL);


		},

		getHierachy: function (filterFunc, callback) {

			var projectCache = [],
				activityCache = [],
				rawActivityCache = [],
				hierachy = {},
				loaded = 0,
				getActivities,
				tidyActivites,
				getProjects,
				myActivities,
				isEmpty;

			if (!callback) {
				callback = filterFunc;
				filterFunc = false;
			}

			/*
			This function gets all the activities that a task has, and maps them all inside eachother
			so that we have a hierachy. Don't touch, you'll *probably* break it if you do.
			 */
			tidyActivites = function (dataRef, filterFunc) {

				var parents = [],
					children = [],
					onlyChildren = [],
					parentID,
					parent,
					parentIndex;

				dataRef = dataRef.filter(function (act) {
					return myActivities.indexOf(act.TaskID) > -1;
				});

				if (!filterFunc) {
					dataRef = dataRef.filter(function (act) {
						return act.EndDate && (act.TaskStatusID === 1 || act.TaskStatusID === 4);
					});
				} else {
					dataRef = dataRef.filter(filterFunc);
				}

				// Take out items which we cant log time on
				dataRef = dataRef.filter(function (act) {
					return act.CanCreateTimeEntries === true;
				});

				parents = dataRef.filter(function (act) {
					return act.HasChild > 0;
				});

				children = dataRef.filter(function (act) {
					return act.ParentID;
				});

				onlyChildren = dataRef.filter(function (act) {
					return !act.ParentID && !act.HasChild;
				});

				if (parents.length > 0) {
					$.each(parents, function (i, par) {

						parentID = par.EntityBaseID;

						if (!parents[i].Activities) {
							parents[i].Activities = [];
						}

						parents[i].Activities = children.filter(function (act, i) {
							return act.ParentID === parentID;
						});

					});

					if (onlyChildren.length > 0) {
						parents = parents.concat(onlyChildren);
					}

					return parents.filter(function (par) {
						if (par.Activities) {
							return !par.ParentID && par.Activities.length > 0;
						} else {
							return !par.ParentID;
						}
					});
				} else {
					return dataRef;
				}

			};

			getProjects = function () {
				timer.API.base("GET", "projects", {}, function (success, data) {

					projectCache = data;
					localforage.setItem("projectCache", data);

					$.each(data, function (i, item) {
						item.Activities = [];
						hierachy[item.EntityBaseID] = this;

						timer.API.base("GET", "projects/" + item.EntityBaseID + "/activities", {},
						function (success, data) {
							loaded += 1;

							activityCache = activityCache.concat(data.filter(function (act) {
								return myActivities.indexOf(act.TaskID) > -1;
							}));

							rawActivityCache = rawActivityCache.concat(data);

							hierachy[item.EntityBaseID].Activities = tidyActivites(data, filterFunc);

							if (loaded === projectCache.length && typeof callback === "function") {
								localforage.setItem("activityCache", activityCache, function () {

									localforage.setItem("rawActivityCache", rawActivityCache, function () {

										var newHier = [];

										$.each(hierachy, function () {
											newHier.push(this);
										});

										newHier = newHier.sort(function (a, b) {
											if (a.Name < b.Name) { return -1 };
											if (a.Name > b.Name) { return 1 };
											return 0;
										});

										callback(newHier);

									});
								});
							}
						});

					});

				});
			};

			timer.API.base("GET", "myactivities", {}, function (success, data) {

				myActivities = data.map(function (act) {
					return act.TaskID;
				});

				getProjects();

			});

		},

		getTimelogs: function (callback) {

			var userToken,
				userID,
				getUserToken,
				getLogs;

			timer.API.base("GET", "timelogs", {}, function (success, data, unfilteredData) {
				localforage.setItem("timelogCache", unfilteredData);
				if (typeof callback === "function") {
					callback(data);
				}
			});

		},

		getTimeForTask: function (taskID, callback) {

			var logs,
				total;

			localforage.getItem("timelogCache", function (logs) {

				total = logs.filter(function (log) {
					return log.TaskID === taskID;
				}).map(function (log) {
					return log.Duration;
				});

				if (total.length) {
					total = total.reduce(function (a, b) {
						return a + b;
					});
				} else {
					total = 0;
				}

				callback(total);

			});

		},

		getProjectName: function (projectID, callback) {

			var ret;

			localforage.getItem("projectCache", function (projects) {

				ret = projects.filter(function (proj) {
					return proj.ProjectID === projectID;
				})[0].Name;

				if (typeof callback === "function") {
					callback(ret);
				}

			});

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
				date.getHours().toString().length === 1 ? "0" + date.getHours() : date.getHours(),
				":",
				date.getMinutes().toString().length === 1 ? "0" + date.getMinutes() : date.getMinutes(),
				":",
				date.getSeconds().toString().length === 1 ? "0" + date.getSeconds() : date.getSeconds(),
			].join('');

			timer.API.base("POST", "timelogs", {
				"UserID" : userID,
				"Duration" : duration,
				"TaskID" : taskID,
				"Description" : description,
				"Billable" : isBillable,
				"EntryDate" : formattedDate
			}, function (success, data) {
				callback(success);
			});

		},

		markForReview: function (taskID, callback) {

			var getUserToken,
				userToken,
				makeRequest,
				taskTypeID = XIGENTIMER.VIEWMODEL.taskTypeID(),
				getTaskType,
				ret;

			timer.API.base("PUT", "activities/" + taskID, {
				"EntityBaseID" : taskID,
				"TaskStatusID" : taskTypeID === 1 ? 18 : 8
			}, function (success, data) {
				callback(success);
			});

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
				}).on("complete",
				function (data) {

					oldLog = data;

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
				}).on("complete",
				function (data, response) {

					if (typeof callback === "function") {

						callback(response.statusCode === 200);

					}

				});

			};

			localforage.getItem("userToken", function (token) {

				userToken = token;

			}).then(getOldLog);

		},

		pulse : function (callback) {

			var makeRequest,
				base;

			XIGENTIMER.VIEWMODEL.isChecking(true);

			localforage.getItem("baseURL", function (b) {
				if (b) {
					makeRequest(b);
				} else {
					XIGENTIMER.VIEWMODEL.isConnected(false);
					XIGENTIMER.VIEWMODEL.isChecking(false);
				}
			});

			makeRequest = function (baseURL) {

				client.get(baseURL).on("complete", function (data, response) {

					if (response.statusCode) {
						XIGENTIMER.VIEWMODEL.isConnected(true);
						XIGENTIMER.VIEWMODEL.isChecking(false);

						if (typeof callback === "function") {
							callback(true);
						}
					}

				}).on("error", function () {
					XIGENTIMER.VIEWMODEL.isConnected(false);
					XIGENTIMER.VIEWMODEL.isChecking(false);

					if (typeof callback === "function") {
						callback(false);
					}
				});

			};

		}

	};

}(XIGENTIMER));