(function (timer) {

	"use strict";

	var keys = {
			CTRL: "modifier",
			ESC: 27,
			ENT: 13,
			SPACE: 32,
			F5 : 116,
			E: 69,
			F: 70,
			L: 76,
			S: 83,
			R: 82,
			T: 84,
			D: 68,
			COMMA: 188,
			QM: 191,
			V: 86,
			ONE: 49,
			TWO: 50,
			THREE: 51,
			FOUR: 52,
			FIVE: 53,
			SIX: 54,
			KONAMI: "38,38,40,40,37,39,37,39,66,65"
		},
		matchesShortcut,
		kPress = [];

	timer.shortCuts = {
		"SUBMIT" : [keys.CTRL, keys.ENT],
		"PLAYPAUSE" : [keys.SPACE],
		"LOGOUT" : [keys.ESC],
		"FIND" : [keys.CTRL, keys.F],
		"REFRESH" : [keys.F5],
		"REFRESH_ALT" : [keys.CTRL, keys.R],
		"EDIT" : [keys.CTRL, keys.E],
		"LOGS" : [keys.CTRL, keys.L],
		"TIMER" : [keys.CTRL, keys.T],
		"SETTINGS" : [keys.CTRL, keys.S],
		"SETTINGS_ALT" : [keys.CTRL, keys.COMMA],
		"DESC" : [keys.CTRL, keys.D],
		"HELP" : [keys.CTRL, keys.QM],
		"VIEW" : [keys.CTRL, keys.V],
		"ONE" : [keys.CTRL, keys.ONE],
		"TWO" : [keys.CTRL, keys.TWO],
		"THREE" : [keys.CTRL, keys.THREE],
		"FOUR" : [keys.CTRL, keys.FOUR]
	};

	matchesShortcut = function (event) {

		var ctrlKey = event.ctrlKey || event.metaKey,
			combo = [],
			matches,
			ret;

		if (ctrlKey) {
			combo.push("modifier");
		}

		combo.push(event.which);

		$.each(timer.shortCuts, function (key, match) {

			matches = true;

			if (combo.length === match.length) {
				$.each(match, function (i, val) {
					if (val !== combo[i]) {
						matches = false;
					}
				});
			} else {
				matches = false;
			}

			if (matches) {
				ret = key;
			}

		});

		return ret;

	};

	$(document).on("keydown", function (e) {

		kPress.push(e.which);

		if (matchesShortcut(e)) {
			e.preventDefault();
			$(document).trigger("keyCombo", {"combo" : matchesShortcut(e)});
		}

		if (kPress.toString().indexOf(keys.KONAMI) >= 0) {
			$(document).trigger("konami");
			kPress = [];
		}

	});

	$(document).on("keyCombo", function (e, data) {

		console.log(data.combo);

	});

}(XIGENTIMER));