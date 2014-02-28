/* globals moment */
(function (timer) {

	"use strict";

	var config = {
			BILLABLE_SEL: "#isBillable",
			REVIEW_SEL: "#markReview",
			RESTORE_SEL: ".do-restore",
			DELETE_SEL: ".do-deleteState",
			STATE_TABLE: ".time-table-state"
		},
		id;

	$(config.STATE_TABLE).on("click", config.RESTORE_SEL, function () {

		id = parseInt($(this).parents("tr").attr("data-id"), 10);

		timer.STATE.restore(id);

	});

	$(config.STATE_TABLE).on("click", config.DELETE_SEL, function () {

		console.log("Delete state");

		id = parseInt($(this).parents("tr").attr("data-id"), 10);

		timer.VIEWMODEL.savedStates.splice(id, 1);

	});

	timer.STATE = {
		save: function () {
			timer.VIEWMODEL.savedStates.push({
				"TaskName" : $(".breadcrumbs li").last().text().trim(),
				"ProjectName" : $(".breadcrumbs li").first().text().trim(),
				"Breadcrumb" : $(".breadcrumbs").html(),
				"TaskID" : XIGENTIMER.VIEWMODEL.selectedProject(),
				"TaskType" : XIGENTIMER.VIEWMODEL.taskTypeID(),
				"TimeLogged" : [(XIGENTIMER.TIMER.getTime().time / 3600).toFixed(2), XIGENTIMER.TIMER.getTime().time],
				"Desc" : XIGENTIMER.VIEWMODEL.activityDesc(),
				"Billable" : $(config.BILLABLE_SEL).is(":checked"),
				"ForReview" : $(config.REVIEW_SEL).is(":checked"),
				"DateStored" : moment().format('lll')
			});

			timer.reset();

			return timer.savedStates;
		},

		restore: function (index) {

			var state = typeof index === "number" ? timer.VIEWMODEL.savedStates()[index] : index,
				estimatedHours,
				soFar,
				ret;

			if (XIGENTIMER.VIEWMODEL.isLoggedIn() && (XIGENTIMER.VIEWMODEL.isTiming() || XIGENTIMER.TIMER.getTime().time > 1)) {

				if (!confirm("You have a timer running, or time that hasn't been sent yet. Restoring this state will lose the current time. Are you sure you want to restore?")) {
					return false;
				}

			}

			XIGENTIMER.reset();

			// Restore breadcrumb text
			XIGENTIMER.BREADCRUMB_CONTAINER.html(state.Breadcrumb);

			// Restore selected project ID
			XIGENTIMER.VIEWMODEL.selectedProject(state.TaskID);
			XIGENTIMER.VIEWMODEL.taskTypeID(state.TaskType);

			// Restore the time
			XIGENTIMER.TIMER.setTime(state.TimeLogged[1]);

			// Restore the description
			XIGENTIMER.VIEWMODEL.activityDesc(state.Desc);

			// Restore the checkboxes
			$(config.BILLABLE_SEL).prop("checked", state.Billable);
			$(config.REVIEW_SEL).prop("checked", state.ForReview);

			// Restore estimated time and things
			localforage.getItem("activityCache", function (acts) {

				ret = acts.filter(function (a) {
					return a.EntityBaseID === state.TaskID;
				})[0] || {};

				estimatedHours = ret.EstimatedHours ? ret.EstimatedHours.toFixed(2) : false;

				XIGENTIMER.API.getTimeForTask(state.TaskID, function (dur) {
					soFar = dur.toFixed(2);

					$("[data-estimate]").text(estimatedHours || "0.00");
					$("[data-sofar]").text(soFar || "---");
				});

			});

			if (typeof index === "number") {
				timer.VIEWMODEL.savedStates.splice(id, 1);
			}

			XIGENTIMER.VIEWMODEL.selectOverview();

		}
	};

}(XIGENTIMER));