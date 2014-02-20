(function (timer) {

	"use strict";

	var drawTree;

	drawTree = function (data) {

		var topLevel,
			ret = document.createDocumentFragment(),
			tmp,
			label,
			append;

		if (!data.length) {
			data = [data];
		}

		$.each(data, function () {

			// By default, we will append when we are done
			append = true;

			// This is our new li to append
			topLevel = document.createElement("li");

			// Set its ID to the item ID, for later
			topLevel.setAttribute("data-id", this.EntityBaseID);

			// If we cant create time entries, we shouldnt append it
			if (this.CanCreateTimeEntries === false) {
				append = false;
			}

			// If an end date isnt set, set a special class
			if (!this.EndDate) {
				$(topLevel).addClass("is-infinite");
			}

			// If the task is waiting for internal approval, add a different class
			if (this.TaskStatusID === 18) {
				$(topLevel).addClass("is-review");
			}

			// Generate label HTML depending on the type of task
			switch (this.TaskTypeID) {
			case 2:
				label = "<div class='label alert'>Issue</div>";
				break;
			case 3:
				label = "<div class='label success'>Request</div>";
				break;
			default:
				label = "<div class='label'>Task</div>";
				break;
			}

			// If we dont have any children, make the item clickable.
			if (this.HasChild === 0) {
				$(topLevel).append("<a href='#'>" + label + "<span>" + this.Name + "</span></a>");
			} else {
				$(topLevel).append("<span>" + this.Name + "</span>");
			}

			// If this does have children, add them into a UL. otherwise, do nothing.
			if (this.Activities && this.Activities.length > 0) {
				tmp = $("<ul>");
				$.each(this.Activities, function () {
					tmp.append(drawTree(this));
				});
				$(topLevel).append(tmp);
			} else {
				append = false;
			}

			// If append is still true, append!
			if (append) {
				ret.appendChild(topLevel);
			}
		});

		return topLevel;

	};

	timer.drawProjects = function (withEndDate) {

		var frag = document.createDocumentFragment(),
			open = [];

		timer.API.getHierachy(function (hierachy) {

			$.each(hierachy, function () {
				if (this.Activities.length > 0) {
					$(frag).append(drawTree(this, withEndDate));
				}
			});

			// Append the new markup
			$(".side-nav").empty().append(frag);

			// Add the infinite/review classes to the parents where necessary
			$(".is-infinite:only-child").parents("li").addClass("is-infinite");
			$(".is-review:only-child").parents("li").addClass("is-review");

			if (!XIGENTIMER.SidebarFilter) {
				XIGENTIMER.SidebarFilter = new XIGENTIMER.ProjectFilter($(".side-nav"), $(".sidebar-filter-wrap input"));
			} else {

				$(".side-nav .is-open").each(function () {
					open.push($(this).parent("li").attr("data-id"));
				});

				XIGENTIMER.SidebarFilter.refresh(open);
			}

		});

	};

}(XIGENTIMER));