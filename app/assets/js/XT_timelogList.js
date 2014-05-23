(function () {

	var config = {
			WRAPPER: ".xt__timelogs--wrap > table > tbody",
			PREV_ATTR: "[data-prev-day]",
			NEXT_ATTR: "[data-next-day]",
			DISPLAY: ".btn--display",
			EDIT_BTN: ".btn--yellow"
		};

	XT.Timeloglist = function () {

		this.init.apply(this, arguments);

	};

	XT.Timeloglist.prototype = {

		init: function () {

			this.day = 0;

			this.addHandlers();

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

			$(config.WRAPPER).on("click", config.EDIT_BTN, function () {

				win = new BrowserWindow({
					width: 900,
					height: 600,
					resizable: false
				});

				win.loadUrl("http://xigen.co.uk/new");
				win.show();

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
					$(t3).html("<a class='btn btn--yellow'>Edit</a>");

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

		}

	};

}());