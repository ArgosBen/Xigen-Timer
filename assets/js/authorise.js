(function (timer) {

	"use strict";

	var getToken,
		checkToken,
		getUser,
		userToken,
		storedUserName,
		completeCall;

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

		var args = arguments;

		if (!userToken || (username && password)) {
			userToken = "Basic " + new Buffer(username + ":" + password).toString('base64');
			localforage.setItem("userToken", userToken).then(function () {
				completeCall.apply(this, args);
			});
		} else {
			completeCall.apply(this, arguments);
		}

	};

	completeCall = function (username, password, callback) {

		if (!password && !callback) {
			callback = username;
			username = storedUserName;
		}

		XIGENTIMER.API.authoriseAPI(username, function (success, user) {
			callback(user, userToken);
		});

	};

	timer.authoriseUser = function (username, password, callback) {

		var args = arguments;

		setTimeout(function () {
			if (XIGENTIMER.VIEWMODEL.isConnected()) {
				getToken(function () {
					checkToken.apply(this, args);
				});
			} else {
				return false;
			}
		}, 200);

	};

}(XIGENTIMER));