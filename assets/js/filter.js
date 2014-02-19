(function () {

	"use strict";

	var config = {
		TEXT_ELEMENT: "span",
		ACTIVE_CLASS: "is-open",
		BREADCRUMB_CLASS: ".breadcrumbs",
		CLEAR_CLASS: ".do-clearfilter"
	};

	XIGENTIMER.ProjectFilter = function (list, input) {

		if (!this instanceof XIGENTIMER.ProjectFilter) {
			return new XIGENTIMER.ProjectFilter(arguments);
		}

		this.list = list.jquery ? list : $(list);
		this.input = input.jquery ? input : $(input);

		this.setup();
		this.addHandlers();

	};

	XIGENTIMER.ProjectFilter.prototype.setup = function () {

		var that = this;

		this.elements = [];

		$.each(this.list.children("li"), function () {

			that.elements.push({
				el: this,
				text: $(this).children("span").first().text()
			});

			this.remove();

		});

		this.showElements(this.matchText($(this.input).val()));

	};

	XIGENTIMER.ProjectFilter.prototype.refresh = function (open) {
	
		this.setup();

		this.draw();

		$("span", this.list).each(function () {

			if (open.indexOf($(this).text()) > -1) {

				$(this).addClass(config.ACTIVE_CLASS);

				$(this).parent("li").children("ul").toggle();

			}

		});

	};

	XIGENTIMER.ProjectFilter.prototype.matchText = function (query) {

		if (query) {
			return this.elements.filter(function (item) {

				return item.text.toLowerCase().indexOf(query.toLowerCase()) > -1;

			});
		} else {
			return this.elements;
		}

	};

	XIGENTIMER.ProjectFilter.prototype.showElements = function (els) {

		var that = this;

		that.list.empty();

		$.each(els, function () {

			that.list.append(this.el);

		});

		$("span", this.list).removeClass(config.ACTIVE_CLASS);

		this.draw();

	};

	XIGENTIMER.ProjectFilter.prototype.addHandlers = function () {

		var that = this;

		this.input.on("keyup", function () {

			that.showElements(that.matchText($(this).val()));

		});

		$(config.CLEAR_CLASS).on("click", function () {

			$(that.input).val("");
			that.showElements(that.matchText($(that.input).val()));

		});

		$(this.list).unbind("click");

		$(this.list).on("click", "li span", function () {

			$(this).toggleClass(config.ACTIVE_CLASS);

			$(this).parent("li").children("ul").toggle();

		});

	};

	XIGENTIMER.ProjectFilter.prototype.draw = function () {

		// Collapsey bits
		$("li ul", this.list).hide();

		$("li a", this.list).each(function () {

			var bc = $(config.BREADCRUMB_CLASS),
				path = [],
				label;

			if (!XIGENTIMER.BREADCRUMB_EMPTY) {
				XIGENTIMER.BREADCRUMB_CONTAINER = bc;
				XIGENTIMER.BREADCRUMB_EMPTY = bc.contents();
			}

			$(this).on("click", function () {

				path = [];
				label = $(this).find(".label");

				if (label.hasClass("alert")) {
					XIGENTIMER.VIEWMODEL.taskTypeID(2);
				} else if (label.hasClass("success")) {
					XIGENTIMER.VIEWMODEL.taskTypeID(3);
				} else {
					XIGENTIMER.VIEWMODEL.taskTypeID(1);
				}

				$(this).parents("li").each(function () {
					path.push($(this).find("span").first().text());
				});

				path = path.filter(function (step) {
					return step !== "";
				}).reverse();

				bc.empty();

				$(path).each(function (i) {

					if (i !== path.length - 1) {
						bc.append("<li class='unavailable'><a href='#'>" + this + "</a></li>");
					} else {
						bc.append("<li class='current'><a href='#'>" + this + "</a></li>");
					}

				});

				XIGENTIMER.VIEWMODEL.selectedProject($(this).parent().attr("data-id"));

			});

		});

	};

}());