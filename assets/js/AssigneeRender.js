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

	timer.AssigneeGenerator.prototype.update = function (callback) {

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

		// An object of ProjectMemberID vs EntityBaseID
		this.PMIDvsEBID = {};

		var that = this;

		XIGENTIMER.API.base("GET", "projects-members?$filter=ProjectID eq " + that.ProjectID, {}, function (success, data, unfilteredData) {

			that.ProjectMemberIDs = unfilteredData.map(function (u) {
				return u.UserID;
			});

			unfilteredData.map(function (u) {
				that.UIDvsPMID[u.UserID] = u.ProjectMemberID;
			});

			console.log(that.UIDvsPMID);

			XIGENTIMER.API.getUserDetails(that.ProjectMemberIDs, function (details) {

				that.possibleAssignees = details;
				
				XIGENTIMER.API.base("GET", "activities-assignees?$filter=TaskID eq " + that.ActivityID, {}, function (success, data, unfilteredData) {

					that.assignedProjectMembers = unfilteredData.map(function (u) {
						that.PMIDvsEBID[u.ProjectMemberID] = u.EntityBaseID;
						return u.ProjectMemberID;
					});

					that.formatData(that.UIDvsPMID, that.assignedProjectMembers);

				});

			});

		});

	};

	timer.AssigneeGenerator.prototype.formatData = function (projectMemberIDs, assignedProjectMemberIDs) {

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

		this.doCallback();

	};

	timer.AssigneeGenerator.prototype.doCallback = function () {

		if (typeof this.callback === "function") {
			this.callback(this.possibleAssignees);
		}

	};

	timer.AssigneeGenerator.prototype.updateAssigness = function (dataSource, callback) {

		var toAssign = dataSource.filter(function (t) {
				return t.isAssigned();
			}).map(function (m) {
				return m.ProjectMemberID;
			}),
			toRemove = dataSource.filter(function (t) {
				return !t.isAssigned();
			}).map(function (m) {
				return m.ProjectMemberID;
			}),
			that = this,
			alreadyAssigned = this.assignedProjectMembers,
			finalToRemove = [],
			finalToAdd = [],
			totalDeletions = 0,
			totalAdditions = 0,
			completedDeletions = false,
			completedAdditions = false,
			checkComplete;

		// If they arent in already assigned, we don't need to remove any
		$.each(toRemove, function () {

			if (alreadyAssigned.indexOf(this) >= 0) {
				finalToRemove.push(that.PMIDvsEBID[this]);
			}

		});

		// If they are to assign and are already assigned, we dont need to add them
		$.each(toAssign, function () {

			if (alreadyAssigned.indexOf(this) < 0) {
				finalToAdd.push(this);
			}

		});

		checkComplete = function () {

			if (typeof callback === "function") {
				callback();
			}

		};

		if (finalToRemove.length > 0) {

			console.log("ToRemove: activities-assignees/" + finalToRemove);

			$.each(finalToRemove, function (index) {

				var id = this;

				timer.API.base("DELETE", "activities-assignees/" + id.toString().trim(), {}, function (s, d, ud) {

					console.log("activities-assignees/" + id, ud);

					totalDeletions += 1;

					if (totalDeletions === toRemove.length) {
						completedDeletions = true;
						checkComplete();
					}

				});
			});

		} else {
			checkComplete();
		}

		if (finalToAdd.length > 0) {

			console.log("toAssign: activities-assignees/" + finalToAdd);

			$.each(finalToAdd, function () {
				timer.API.base("POST", "activities-assignees?$filter=TaskID eq " + that.ActivityID, {
					"TaskID" : that.ActivityID,
					"WorkIsDone" : false,
					"ProjectMemberID" : this
				}, function (s, d) {

					console.log(d);

					totalAdditions += 1;

					if (totalAdditions === toAssign.length) {
						completedAdditions = true;
						checkComplete();
					}

				});
			});

		} else {
			checkComplete();
		}

	};

}(XIGENTIMER));