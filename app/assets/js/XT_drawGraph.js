(function () {

	window.moment = moment = require('./assets/js/moment.min.js');

	var plot = function (data) {

		var testData = data,
			tooltipPositioned = false;
			avg = testData.map(function (i) { 
				return i[1]; 
			}).reduce(function (a, b) {
				return a + b;
			}) / testData.length;

		$.plot($(".xt__timelogs--graph"), [
			{
				data: testData,
				color : "rgba(255, 255, 255, 0)",
				bars: {
					"show" : true,
					"fill" : true,
					"fillColor" : "#2980b9",
					"align" : "center",
					"barWidth" : 0.7,
				},
				threshold: {
					below: 4.5,
					color: "red"
				}
			}
		], {
			xaxis: {
				ticks: [
					[1, moment().subtract('days', 5).format("ddd")],
					[2, moment().subtract('days', 4).format("ddd")],
					[3, moment().subtract('days', 3).format("ddd")],
					[4, moment().subtract('days', 2).format("ddd")],
					[5, moment().subtract('days', 1).format("ddd")]
				],
				font: {
					weight: "bold",
					color: "#333333"
				},
				autoscaleMargin: 0.02
			},
			grid: {
				minBorderMargin: 10,
				hoverable: true,
				clickable: true,
				autoHighlight: true
			}
		});

		$(".xt__timelogs--graph").on('plothover', function ( event, pos, item ) {

			if (item) {

				if (!$(".graph-tooltip").length) {
					$("body").append($("<div class='graph-tooltip' />"));
				}

				$(".graph-tooltip").show().css({
					right: ($(".xt__timelogs--graph").width() / 2) + 15
				}).html("<strong>" + moment().subtract(5 - item.datapoint[0], 'days').format("DD/MM/YYYY") + "</strong>" + item.datapoint[1] + " hrs");

			} else {
				$(".graph-tooltip").hide();
			}
		});

	};

	XT.drawGraph = function (data) {

		if (!$.fn.plot) {
			require('./assets/js/jquery.flot.min.js');	
		}

		XT.socket.emit("get", [{type: "timelogs"}]);

		XT.socket.once("data", function (data) {
			
			var FiveDaysAgo = moment().subtract('days', 5).format("YYYY-MM-DD"),
				pastWeek,
				days = [0, 0, 0, 0, 0],
				triplet,
				diff,
				parts = FiveDaysAgo.split("-");

			pastWeek = data.timelogs.forEach(function (d) {

				triplet = moment(d.EntryDate, "YYYY-MM-DD/HH:mm:ss.SS");
				diff = triplet.diff(FiveDaysAgo, 'days');

				if (diff >= 0) {
					days[diff] += d.Duration;
				}

			});

			plot(days.slice(0, 5).map(function (d, i) {
				return [i + 1, d];
			}));

		});

	};
}());