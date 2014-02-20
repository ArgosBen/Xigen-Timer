$(function () {

	"use strict";

	var avatarURL = "http://projectsvm.xigen.co.uk/ImagePage.aspx?t=0",
		defaultText,
		submit = $(".login [type=submit]"),
		VIEWMODEL,
		sidebarFilter;

	// Foundation
	$(document).foundation();

	XIGENTIMER.VIEWMODEL = new XIGENTIMER.ViewModel();
	ko.applyBindings(XIGENTIMER.VIEWMODEL);

	$(".do-reset").on("click", function () {
		XIGENTIMER.reset();
	});

	// View online button
	$(".do-viewonline").on("click", function () {
		localforage.getItem("baseURL", function (u) {
			u = u.replace("/rest/v1/", "");
			XIGENTIMER.launchExternal(u + "/TaskDetails.aspx?ID=" + VIEWMODEL.selectedProject());
		});
	});

	// External links
	$("body").on("click", "a", function (e) {
		if ($(this).attr("target") === "_system") {
			e.preventDefault();
			XIGENTIMER.launchExternal($(this).attr("href"));
		}
	});

	// Edit timelog button
	$(".time-table").on("click", ".button", function () {
		XIGENTIMER.editTimeLog($(this).parents("tr").attr("data-id"), this);
	});

	// Icons
	$(".icon-min").on("click", function () {
		XIGENTIMER.minimize();
	});

	$(".icon-hide").on("click", function () {
		XIGENTIMER.goToTray();
	});

	$(".icon-close").on("click", function () {
		XIGENTIMER.close();
	});

});