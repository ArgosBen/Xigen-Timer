(function () {

	var config = {
			WRAPPER: ".xt__timelogs--wrap > table > tbody",
			PREV_ATTR: "[data-prev-day]",
			NEXT_ATTR: "[data-next-day]",
			DISPLAY: ".btn--display",
			EDIT_BTN: ".btn--yellow",
			OFFCANVAS_CLASS: ".xt__timelog-edit",
			OFFCANVAS_OPEN_CLASS: "is-open",
			OFFCANVAS_CLOSE_CLASS: "[data-offcanvas-close], .xt__timelog-edit__overlay",
			UPDATE_BTN_LOADING: "Wait",
			UPDATE_BTN_STANDARD: "Edit"
		};

	XT.Timeloglist = function () {

		this.init.apply(this, arguments);

	};

	XT.Timeloglist.prototype = {

		init: function () {

			this.day = 0;

			this.addHandlers();

			this.addValidation();

			// Setup moment
			moment.lang('en', {
				calendar : {
					lastDay : '[Yesterday]',
					sameDay : '[Today]',
					nextDay : '[Tomorrow]',
					lastWeek : 'dddd',
					nextWeek : 'dddd [at] LT',
					sameElse : 'L'
				}
			});

			this.toggleButtons();

			this.getLogs(0); // Get today

		},

		addHandlers: function () {

			var that = this,
				remote = require("remote"),
				BrowserWindow = remote.require('browser-window'),
				win;

			$(config.PREV_ATTR).on("click", function () {
				that.getLogs(that.day + 1);
				that.day += 1;
				that.toggleButtons();
			});

			$(config.NEXT_ATTR).on("click", function () {
				that.getLogs(that.day - 1);
				that.day -= 1;
				that.toggleButtons();
			});

			$(config.WRAPPER).on("click", config.EDIT_BTN, function (e) {
				e.preventDefault();
				$(this).text(config.UPDATE_BTN_LOADING).attr("disabled", "disabled");
				that.loadLogAndOpenEdit($(this).attr("data-log"), this);
			});

			$(config.OFFCANVAS_CLASS).on("click", config.OFFCANVAS_CLOSE_CLASS, function (e) {
				e.preventDefault();
				$(config.OFFCANVAS_CLASS).removeClass(config.OFFCANVAS_OPEN_CLASS);
			});

		},

		getLogs: function (dayDifference) {

			var that = this;

			XT.socket.emit("timelogsForDay", dayDifference);

			XT.socket.once("timelogs", function (data) {
				that.drawDisplay(dayDifference);
				that.drawLogs(data);
			});

		},

		drawLogs: function (data) {

			var frag = document.createDocumentFragment();

			if (data.length > 0) {

				data.forEach(function (d) {

					var row = document.createElement("tr"),
						t1 =  document.createElement("td"),
						t2 =  document.createElement("td"),
						t3 =  document.createElement("td");

					$(t1).html(d.Duration + "<small>hrs.</small>");
					$(t2).text(d.Description);
					$(t3).html("<a data-log='" + d.EntityBaseID + "' class='btn btn--yellow'>Edit</a>");

					$(row).append(t1);
					$(row).append(t2);
					$(row).append(t3);

					frag.appendChild(row);

				});

			} else {

				frag.appendChild($("<tr><td><i class='fa fa-exclamation-triangle'></i> No hours found!</td></tr>")[0]);

			}

			$(config.WRAPPER).empty();
			$(config.WRAPPER)[0].appendChild(frag);

		},

		drawDisplay: function (dayDifference) {

			$(config.DISPLAY).text(moment().
					hours(0).
					minutes(0).
					seconds(0).
					subtract(dayDifference, 'days').calendar());

		},

		toggleButtons: function () {

			if (this.day === 0) {
				$(config.NEXT_ATTR).attr("disabled", "disabled");
			} else {
				$(config.NEXT_ATTR).removeAttr("disabled");
			}

		},

		loadLogAndOpenEdit: function (id, btn) {

			var offcanvas = $(config.OFFCANVAS_CLASS),
				dateTitle = offcanvas.find("[data-date]"),
				dateField = offcanvas.find("[name=date]"),
				descField = offcanvas.find("[name=description]"),
				durationField = offcanvas.find("[id=duration]"),
				billableField = offcanvas.find("[name=isBillable]"),
				submitBtn = offcanvas.find("[type=submit]"),
				activityField = offcanvas.find("[data-activity]"),
				projectField = offcanvas.find("[data-project]"),
				entryDate,
				activity,
				project,
				d,
				that = this;

			XT.socket.emit("get", [{
				type: "timelogs",
				id: id
			},
			{
				type: "activities"
			}, {
				type: "projects"
			}]);

			XT.socket.once("data", function (data) {

				d = data.timelogs[id];
				that.cachedLog = d;

				entryDate = moment(d.EntryDate, "YYYY-MM-DD/HH:mm:ss.SS");

				activity = data.activities.filter(function (act) {
					return act.EntityBaseID === d.TaskID;
				})[0];

				project = data.projects.filter(function (proj) {
					return proj.ProjectID === activity.ProjectID;
				})[0];

				projectField.text(project.Name);
				activityField.text(activity.Name);
				dateField.val(entryDate.format("YYYY-MM-DD"));
				dateTitle.text(entryDate.format("DD/MM/YYYY"));
				descField.val(d.Description);
				durationField.val(d.Duration);
				billableField.prop("checked", d.Billable);

				if (!d.CanEdit) {
					submitBtn.attr("disabled", "disabled").text("Locked");
				} else {
					submitBtn.removeAttr("disabled").text("Update");
				}

				$(config.OFFCANVAS_CLASS).addClass(config.OFFCANVAS_OPEN_CLASS);
				$(btn).text(config.UPDATE_BTN_STANDARD).removeAttr("disabled");

			});

		},

		addValidation: function () {

			var that = this;

			$.getScript("http://ajax.aspnetcdn.com/ajax/jquery.validate/1.12.0/jquery.validate.min.js", function () {

				$(".xt__timelog-edit__fields").validate({
					rules: {
						date: {
							required: true
						},
						duration: {
							required: true,
							number: true,
							min: 0
						},
						description: {
							required: true
						}
					},
					errorClass: "is-error",
					errorPlacement: function () {
						return true;
					},
					submitHandler: function (form) {

						form = $(form);

						var dateField = form.find("[name=date]"),
							descField = form.find("[name=description]"),
							durationField = form.find("[id=duration]"),
							billableField = form.find("[name=isBillable]"),
							logData;

						logData = {
							EntryDate: moment(dateField.val(), "YYYY-MM-DD").format("YYYY-MM-DDTHH:mm:ss.SS"),
							Description: descField.val(),
							Duration: durationField.val(),
							Billable: billableField.prop("checked")
						};

						XT.socket.emit("updateTime", $.extend(that.cachedLog, logData));

						XT.socket.once("logPosted", function (success) {

							if (success) {
								that.getLogs(that.day);
								$(config.OFFCANVAS_CLASS).removeClass(config.OFFCANVAS_OPEN_CLASS);
							}

						});

					}
				});

			});

		}

	};

}());