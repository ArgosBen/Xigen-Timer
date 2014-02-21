(function (timer) {

	"use strict";

	var config = {
		DESC_SEL: "[id=desc]",
		BILLABLE_CHECKBOX: "#isBillable",
		REVIEW_CHECKBOX: "#markReview"
	};

	timer.reset = function () {

		XIGENTIMER.TIMER.setTime(0);
		XIGENTIMER.UPDATEPOPUP.find("input").val(0);
		$(config.DESC_SEL).val("").trigger("change");
		$(config.BILLABLE_CHECKBOX).prop("checked", true);
		$(config.REVIEW_CHECKBOX).prop("checked", false);

		// Reset - false for not logging out
		XIGENTIMER.VIEWMODEL.reset(false);

		XIGENTIMER.BREADCRUMB_CONTAINER.empty().append(XIGENTIMER.BREADCRUMB_EMPTY);

		XIGENTIMER.updateDatePickers();

	};

}(XIGENTIMER));