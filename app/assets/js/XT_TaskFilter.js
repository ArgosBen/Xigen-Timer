(function (xt) {

	"use strict";

	var config = {
		FILTERS: ".xt__tasks__filters",
		TASKS: ".xt__tasks__tasks",
		TASKS_BODY: ".xt__tasks__body",
		APPLY: ".btn--info",
		RESET: ".btn--yellow",
		REFRESH: ".btn--warning",
		NAME: "[name=nameFilter]",
		NO_END_DATE: "#withoutEndDate",
		WAITING_REVIEW: "#waitingReview"
	};

	xt.TaskFilter = function () {

		this.init.apply(this, arguments);

	};

	xt.TaskFilter.prototype = {

		init: function () {

			this.el = $(config.FILTERS);
			this.apply = $(config.APPLY, this.el);
			this.reset = $(config.RESET, this.el);
			this.refresh = $(config.REFRESH, this.el);

			this.discoverInputs();

			this.addHandlers();

			this.calculateFilterFunction();

		},

		discoverInputs: function () {

			this.noEndDate = $(config.NO_END_DATE, this.el);
			this.waitingReview = $(config.WAITING_REVIEW, this.el);
			this.nameField = $(config.NAME, this.el);

			this.noEndDateState = false;
			this.waitingReviewState = false;
			this.nameFieldState = false;

		},

		calculateFilterFunction: function () {

			var endDate = this.noEndDate.prop("checked"),
				waitingReview = this.waitingReview.prop("checked"),
				nameFilter = this.nameField.val(),
				that = this;

			XT.socket.emit("filteredActivites", {
				waitingReview: waitingReview,
                endDate: endDate,
                textFilter: nameFilter
			});

			this.noEndDateState = endDate;
			this.waitingReviewState = waitingReview;
			this.nameFieldState = !!nameFilter;

			XT.socket.once("filteredActivites", function (data) {
				that.getProjectNames(data);
			});

		},

		addHandlers: function () {

			var that = this,
				changeHandler;

			changeHandler = function () {
				that.checkResetButton();
				that.checkApplyButton();
			};

			this.apply.on("click", function (e) {
				e.preventDefault();
				that.calculateFilterFunction();
			});

			this.noEndDate.on("change", changeHandler);
			this.waitingReview.on("change", changeHandler);
			this.nameField.on("keyup", changeHandler);

		},

		checkResetButton: function () {

			var reset = false;

			if (this.noEndDate.prop("checked") === true) {
				reset = true;
			}

			if (this.waitingReview.prop("checked") === true) {
				reset = true;
			}

			if (this.nameField.val()) {
				reset = true;
			}

			console.log(reset);

			if (reset) {
				this.reset.removeAttr("disabled");
			} else {
				this.reset.attr("disabled", "disabled");
			}

		},

		checkApplyButton: function () {

			var apply = false;

			if (this.noEndDate.prop("checked") !== this.noEndDateState) {
				apply = true;
			}

			if (this.waitingReview.prop("checked") !== this.waitingReviewState) {
				apply = true;
			}

			if ((!!this.nameField.val()) !== this.nameFieldState) {
				apply = true;
			}

			console.log(apply);

			if (apply) {
				this.apply.removeAttr("disabled");
			} else {
				this.apply.attr("disabled", "disabled");
			}

		},

		getProjectNames: function (activites) {

			var activityData = activites,
				request = [],
				that = this;

			activityData.forEach(function (a) {
				request.push({
					"type" : "projects",
					"id" : a.ProjectID
				});
			});

			XT.socket.emit("get", request);

			XT.socket.once("data", function (data) {
				that.drawActivites(data, activityData);
			});

		},

		drawActivites: function (projectData, activityData) {

			var table = document.createElement("table"),
				table_body = document.createElement("table"),
				thead = document.createElement("thead"),
				fromNow,
				row;

			// Header

			$(thead).append("<tr></tr>");
			$(thead).find("tr").append("<th>Project Name</th>");
			$(thead).find("tr").append("<th>Task Name</th>");
			$(thead).find("tr").append("<th>Due Date</th>");
			$(thead).find("tr").append("<th>Priority</th>");

			$(table).append(thead);

			$(config.TASKS).empty();
			$(table).attr({
				"cellspacing" : 0,
				"cellpadding" : 0
			}).appendTo(config.TASKS);

			// Body

			$.each(activityData, function () {

				row = document.createElement("tr");
				fromNow = this.EndDate ? moment(this.EndDate, "YYYY-MM-DD/HH:mm:ss.SS").fromNow() : "--";

				$(row).append("<td>" + projectData.projects[this.ProjectID].Name + "</td>");
				$(row).append("<td>" + this.Name + "</td>");
				$(row).append("<td>" + fromNow + "</td>");
				$(row).append("<td data-priority='" + this.PriorityID + "' >" + XT.i18n.priorities[this.PriorityID] + "</td>");

				$(table_body).append(row);

			});

			$(config.TASKS_BODY).empty();
			$(table_body).attr({
				"cellspacing" : 0,
				"cellpadding" : 0
			}).appendTo(config.TASKS_BODY);

		}

	};

}(XT));