(function (timer) {

	"use strict";

	var getToken,
		checkToken,
		getUser,
		userToken,
		storedUserName;

	getToken = function (callback) {

		localforage.getItem("userToken", function (t) {

			userToken = t ? t : false;

		}).then(
			getUser.apply(this, arguments)
		);

	};

	getUser = function (callback) {

		localforage.getItem("userName", function (u) {

			storedUserName = u;

		}).then(callback);

	};

	checkToken = function (username, password, callback) {

		console.log(arguments);

		if (!userToken) {
			userToken = "Basic " + new Buffer(username + ":" + password).toString('base64');
		}

		if (!password && !callback) {
			callback = username;
			username = storedUserName;
		}

		XIGENTIMER.API.authorizeUser(userToken, username, function (user) {
			callback(user);
		});

	};

	timer.authoriseUser = function (username, password, callback) {

		var args = arguments;

		getToken(function () {
			checkToken.apply(this, args);
		});

	};

}(XIGENTIMER));