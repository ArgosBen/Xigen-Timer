(function (xt) {

	"use strict";

	xt.Timer = function () {
		this.init.apply(this, arguments);
	};

	xt.Timer.prototype = {

		init: function (el) {

			this.el = el.jquery ? el[0] : el;

			this.findElements();

		},

		findElements: function () {

			this.hours = $(this.el).find("[data-hours] span").first();
			this.minutes = $(this.el).find("[data-minutes] span").first();
			this.seconds = $(this.el).find("[data-seconds] span").first();

		},

		start: function () {

			var that = this;

			this.interval = setInterval(function () {

				that.tick();

			}, 1000);

		},

		stop: function () {

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
			} else if (m === 59) {
				h += 1;
				m = 0;
				s += 1;
				this.pulse(this.seconds);
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

		}

	};

}(XT));