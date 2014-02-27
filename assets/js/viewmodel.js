(function (timer) {

	"use strict";

	var os = require('os');

	XIGENTIMER.ViewModel = function () {

		var that = this;

		// Is the the user logged in?
		this.isLoggedIn = ko.observable(false);

		// Is the user logged out?
		this.isLoggedOut = ko.computed(function () {
			return !that.isLoggedIn();
		});

		// The ID of the project selected by the user
		this.selectedProject = ko.observable(false);

		// Is the user currently timing something?
		this.isTiming = ko.observable(false);

		// The current description for the timer which is running - Updated by the textarea [name=desc]
		this.activityDesc = ko.observable("");

		// If the user is currently editing their timelogs
		this.isEditingTime = ko.observable(false);

		// If the user is currently viewing stored time
		this.isRestoringTime = ko.observable(false);

		// If the user is currently viewing their tasks
		this.isViewingTasks = ko.observable(false);

		// The TaskTypeID of the currently selected task
		this.taskTypeID = ko.observable(1);

		// If the overview (timer page) is selected/open
		this.isOverview = ko.computed(function () {
			return !that.isEditingTime() && that.isLoggedIn() && !that.isRestoringTime() && !that.isViewingTasks();
		});

		// Used to force update
		this.dummy = ko.observable();

		// If the user has a project selected
		this.hasProjectSelected = ko.computed(function () {
			return !! that.selectedProject();
		});

		// If the user can currently edit the time logged (true if the timer isn't running)
		this.canEdit = ko.computed(function () {
			return !that.isTiming();
		});

		// If the user can send their currently stored hours.
		// Depends on:
		// - Description not empty
		// - Timer not running
		// - More than 0s logged
		// - A project is selected
		this.canSendTime = ko.computed(function () {
			// Put this here, so it is subscribed
			that.dummy();
			return !!that.activityDesc() && !that.isTiming() && XIGENTIMER.TIMER.getTime().time -1 > 0 && that.hasProjectSelected() && that.isConnected();
		});

		// Changes the text for the "Mark as waiting review" depending on the type of task selected
		// - Hidden in request is used, as I dont know what to do with these
		this.markText = ko.computed(function () {

			switch(that.taskTypeID()) {
			case 1:
				return "Send for internal review";
			case 2:
				return "Mark as fixed";
			default:
				return "Send for internal review";
			}

		});

		// Should the "Mark as waiting review" box be shown?
		// - Yes, if a request isnt selected
		this.showMarkComplete = ko.computed(function () {
			return that.taskTypeID() !== 3;
		});

		// If we aren't on OSX
		this.notOSX = !/darwin/.test(os.platform());

		// Stop the hooks firing on first init
		this.supressChangeOne = ko.observable(true);
		this.supressChangeTwo = ko.observable(true);

		// If we should show items which are waiting for internal review
		this.showReviewItems = ko.observable(false);

		localforage.getItem("showReviewItems", function (val) {
			if (val) {
				that.showReviewItems(val);
			}
			that.supressChangeOne(false);
		});

		// If we should show items which have no end date
		this.showInfiniteItems = ko.observable(false);

		localforage.getItem("showInfiniteItems", function (val) {
			if (val) {
				that.showInfiniteItems(val);
			}
			that.supressChangeTwo(false);
		});

		// Update the body classs depending on if we are showing/hiding waiting internal review or not.
		this.showReviewItems.subscribe(function (val) {

			if (!that.supressChangeOne()) {

				if (val === true) {
					$("body").addClass("show-review");
				} else {
					$("body").removeClass("show-review");
				}

				localforage.setItem("showReviewItems", val);

				that.updateFromFilters();

			} else {

				that.supressChangeOne(false);

			}

		});

		// Update the body classs depending on if we are showing/hiding items waiting internal review or not.
		this.showInfiniteItems.subscribe(function (val) {

			if (!that.supressChangeTwo()) {

				if (val === true) {
					$("body").addClass("show-infinite");
				} else {
					$("body").removeClass("show-infinite");
				}

				localforage.setItem("showInfiniteItems", val);

				that.updateFromFilters();

			} else {

				that.supressChangeTwo(false);

			}

		});

		this.updateFromFilters = function (callback) {

			var forReview = that.showReviewItems(),
				isInfinite = that.showInfiniteItems();

			$(".do-refresh").addClass("is-refreshing").attr("disabled", "disabled");

			XIGENTIMER.drawProjects(function () {
				$(".do-refresh").removeClass("is-refreshing").removeAttr("disabled");

				if (typeof callback === "function") {
					callback();
				}

			}, forReview, isInfinite);

		};

		// Change timing page
		this.selectTiming = function () {
			that.isEditingTime(true);
			that.isRestoringTime(false);
			that.isViewingTasks(false);
		};

		// Change to overview page
		this.selectOverview = function () {
			that.isEditingTime(false);
			that.isRestoringTime(false);
			that.isViewingTasks(false);
		};

		this.selectRestore = function () {
			that.isEditingTime(false);
			that.isRestoringTime(true);
			that.isViewingTasks(false);
		};

		this.selectTasks = function () {
			that.isEditingTime(false);
			that.isRestoringTime(false);
			that.isViewingTasks(true);
		};

		// Update the dummy function so that canSendTime will recompute
		this.recalcCanSend = function () {
			that.dummy.notifySubscribers();
		};

		// Reset all the things for logout
		this.reset = function (logout) {

			if (logout) {
				that.isLoggedIn(false);
				that.isEditingTime(false);
			}

			that.activityDesc("");
			that.isTiming(false);
			that.recalcCanSend();
			that.selectedProject(false);

		};

		// Do we have a connection to the projects system?
		this.isConnected = ko.observable(false);
		this.isChecking = ko.observable(false);

		this.connectedText = ko.computed(function () {

			if (that.isConnected() && !that.isChecking()) {
				return "Connected to System";
			} else if (that.isChecking()) {
				return "Checking pulse...";
			} else {
				return "Not Connected.";
			}

		});

		this.checkPulse = function () {

			XIGENTIMER.API.pulse();

		};

		this.savedStates = ko.observableArray([]);

		localforage.getItem("savedStates", function (val) {
			if (val) {
				that.savedStates(val);
			}
		});

		this.saveState = function () {
			XIGENTIMER.STATE.save();
		};

		this.savedStates.subscribe(function (val) {
			localforage.setItem("savedStates", val);
		});

		this.canSaveState = ko.computed(function () {

			return !that.isTiming() && that.hasProjectSelected();

		});

		this.taskList = ko.observableArray([]);

		this.priorities = {
			5 : "<strong>Mission Critical</strong>",
			4 : "Urgent",
			3 : "High",
			2 : "Medium",
			1 : "Low",
		};

	};

	$(function () {
		XIGENTIMER.VIEWMODEL = new XIGENTIMER.ViewModel();
		ko.applyBindings(XIGENTIMER.VIEWMODEL);
	});

}(XIGENTIMER));