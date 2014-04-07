(function (xt) {

	"use strict";

	var config = {
		CLASS_PAUSED: "is-paused",
		CLASS_RUNNING : "is-running"
	};

	xt.Timer = function () {
		this.init.apply(this, arguments);
	};

	xt.Timer.prototype = {

		init: function (el) {

			this.el = el.jquery ? el[0] : el;

			this.findElements();
			this.isRunning = false;

		},

		findElements: function () {

			this.hours = $(this.el).find("[data-hours] span").first();
			this.minutes = $(this.el).find("[data-minutes] span").first();
			this.seconds = $(this.el).find("[data-seconds] span").first();

		},

		start: function () {

			var that = this;

			if (this.isRunning) {
				return false;
			}

			this.isRunning = true;

			$(this.el).addClass(config.CLASS_RUNNING);
			$(this.el).removeClass(config.CLASS_PAUSED);

			this.interval = setInterval(function () {

				that.tick();

			}, 1000);

		},

		stop: function () {

			$(this.el).addClass(config.CLASS_PAUSED);
			$(this.el).removeClass(config.CLASS_RUNNING);

			this.isRunning = false;

			clearInterval(this.interval);

		},

		tick: function () {

			var h,
				m,
				s;

			h = parseInt(this.hours.text(), 10);
			m = parseInt(this.minutes.text(), 10);
			s = parseInt(this.seconds.text(), 10);

			if (s === 59) {
				m += 1;
				s = 0;
				this.pulse(this.minutes);
			} else if (m === 59 && s === 59) {
				h += 1;
				m = 0;
				s = 0;
				this.pulse(this.hours);
			} else {
				s += 1;
				this.pulse(this.seconds);
			}

			this.time = [h, m, s];

			this.hours.text(h);
			this.minutes.text(m);
			this.seconds.text(s);

		},

		pulse: function (el) {

			var target = $(el).parent(".xt__timer__clock__roundel");

			$(target).addClass("changed");

			setTimeout(function () {
				$(target).removeClass("changed");
			}, 600);

		},

		setTime: function (triplet) {

			if (this.isRunning) {
				return false;
			}

			this.hours.text(triplet[0]);
			this.minutes.text(triplet[1]);
			this.seconds.text(triplet[2]);

			this.time = triplet;

			if (this.time.reduce(function (a, b) {
				return a + b;
			}) > 0) {
				$(this.el).addClass(config.CLASS_PAUSED);
			} else {
				$(this.el).removeClass(config.CLASS_PAUSED);
			}

		},

		reset: function () {

			if (this.isRunning) {
				return false;
			}

			this.setTime([0, 0, 0]);
		}

	};

}(XT));