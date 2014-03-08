(function (timer) {

	"use strict";

	timer.AssigneeGenerator = function (ActivityID, ProjectID, callback) {

		if (!this instanceof timer.AssigneeGenerator) {
			return new timer.AssigneeGenerator(arguments);
		}

		this.ActivityID = ActivityID;
		this.ProjectID = ProjectID;
		this.callback = callback;

		this.getRequiredData();

	};

	timer.AssigneeGenerator.prototype.getRequiredData = function () {

		// All the project member IDs for the parent project
		this.projectMemberIDs = null;

		// All the possible users that can be assigned
		this.possibleAssignees = null;

		// All the assigned project member IDs to the task
		this.assignedProjectMembers = null;

		// An object of UserID vs ProjectMemberID
		this.UIDvsPMID = {};

		var that = this;

		XIGENTIMER.API.base("GET", "projects-members?$filter=ProjectID eq " + that.ProjectID, {}, function (success, data, unfilteredData) {

			that.ProjectMemberIDs = unfilteredData.map(function (u) {
				return u.UserID;
			});

			unfilteredData.map(function (u) {
				that.UIDvsPMID[u.UserID] = u.ProjectMemberID;
			});

			XIGENTIMER.API.getUserDetails(that.ProjectMemberIDs, function (details) {

				that.possibleAssignees = details;
				
				XIGENTIMER.API.base("GET", "activities-assignees?$filter=TaskID eq " + that.ActivityID, {}, function (success, data, unfilteredData) {

					that.assignedProjectMembers = unfilteredData.map(function (u) {
						return u.ProjectMemberID;
					});

					that.formatData(that.UIDvsPMID, that.assignedProjectMembers);

				});

			});

		});

	};

	timer.AssigneeGenerator.prototype.formatData = function ( projectMemberIDs, assignedProjectMemberIDs) {

		var record,
			userDetails = this.possibleAssignees;

		$.each(userDetails, function () {

			record = this;

			record.ProjectMemberID = projectMemberIDs[record.UserID];

			if (assignedProjectMemberIDs.indexOf(record.ProjectMemberID) > -1) {
				record.isAssigned = ko.observable(true);
			} else {
				record.isAssigned = ko.observable(false);
			}

		});

		this.getBaseURL();

	};

	timer.AssigneeGenerator.prototype.getBaseURL = function () {

		var that = this;

		localforage.getItem("baseURL", function (b) {
			that.baseURL = b.charAt(b.length - 1) === "" ? b : b + "/";

			that.updateAvatars();
		});

	};

	timer.AssigneeGenerator.prototype.updateAvatars = function () {

		var that = this;

		$.each(this.possibleAssignees, function () {

			this.AvatarURL = that.baseURL + "ImagePage.aspx?t=0&h=" + this.AvatarHash + "&id=" + this.UserID;

		});

		for (var i = 0; i < 5; i += 1) {
			this.possibleAssignees = this.possibleAssignees.concat(this.possibleAssignees);
		}

		this.doCallback();

	};

	timer.AssigneeGenerator.prototype.doCallback = function () {

		if (typeof this.callback === "function") {
			this.callback(this.possibleAssignees);
		}

	};

}(XIGENTIMER));