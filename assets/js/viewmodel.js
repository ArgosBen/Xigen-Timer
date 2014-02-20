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

		// The TaskTypeID of the currently selected task
		this.taskTypeID = ko.observable(1);

		// If the overview (timer page) is selected/open
		this.isOverview = ko.computed(function () {
			return !that.isEditingTime() && that.isLoggedIn();
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
			return !!that.activityDesc() && !that.isTiming() && XIGENTIMER.TIMER.getTime().time -1 > 0 && that.hasProjectSelected();
		});

		// Changes the text for the "Mark as waiting review" depending on the type of task selected
		// - Hidden in request is used, as I dont know what to do with these
		this.markText = ko.computed(function () {

			switch(that.taskTypeID()) {
			case 1:
				return "Send for internal review";
			case 2:
				return "Mark as closed?";
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

		// If we should show items which are waiting for internal review
		this.showReviewItems = ko.observable(false);

		// If we should show items which have no end date
		this.showInfiniteItems = ko.observable(false);

		// Update the body classs depending on if we are showing/hiding waiting internal review or not.
		this.showReviewItems.subscribe(function (val) {

			if (val === true) {
				$("body").addClass("show-review");
			} else {
				$("body").removeClass("show-review");
			}

		});

		// Update the body classs depending on if we are showing/hiding items waiting internal review or not.
		this.showInfiniteItems.subscribe(function (val) {

			if (val === true) {
				$("body").addClass("show-infinite");
			} else {
				$("body").removeClass("show-infinite");
			}

		});

		// Change timing page
		this.selectTiming = function () {
			that.isEditingTime(true);
		};

		// Change to overview page
		this.selectOverview = function () {
			that.isEditingTime(false);
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

	};

	$(function () {
		XIGENTIMER.VIEWMODEL = new XIGENTIMER.ViewModel();
		ko.applyBindings(XIGENTIMER.VIEWMODEL);
	});

}(XIGENTIMER));