var InputDisplay = function(keyMap, playerIndex) {
	var OFFSETS = {
		LEFT: vec(0, 1),
		UP: vec(1, 0),
		RIGHT: vec(2, 1),
		DOWN: vec(1, 1),
	};

	var LABELS = {
		37: '\u2190',
		38: '\u2191',
		39: '\u2192',
		40: '\u2193',

		65: 'A',
		87: 'W',
		68: 'D',
		83: 'S'
	};

	var scale = 1;
	var highlighted = {};

	var elements = Object.keys(keyMap).filter(function(keyCode) {
		return keyMap[keyCode].index === playerIndex;
	}).map(function(keyCode) {
		var dir = keyMap[keyCode].dir;
		return {
			offset: OFFSETS[dir],
			label: LABELS[keyCode],
			dir: dir
		};
	});

	return {
		size: function() {
			var size = KEY_DISPLAY_STYLE.size * scale;
			var margin = KEY_DISPLAY_STYLE.margin;
			return vec(3 * size + 2 * margin, 2 * size + margin);
		},
		render: function(context) {
			var size = KEY_DISPLAY_STYLE.size * scale;
			var step = size + KEY_DISPLAY_STYLE.margin;

			elements.forEach(function(element) {
				renderTranslated(context, element.offset.x * step, element.offset.y * step, function(context) {
					KeyDisplay.render(context, element.label, size, highlighted[element.dir]);
				});
			});
		},
		highlight: function(dir) {
			highlighted[dir] = true;
		},
		clearHighlights: function() {
			highlighted = {};
		},
		set scale(value) {
			scale = value;
		}
	};
};