var InputDisplay = (function() {
	var OFFSETS = {
		LEFT: vec(-1, 0),
		UP: vec(0, -1),
		RIGHT: vec(1, 0),
		DOWN: vec(0, 0),
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

	return {
		render: function(context, offset, inputDisplay, keyMap, playerIndex) {
			renderTranslated(context, offset.x, offset.y, function(context) {
				var step = KEY_DISPLAY_STYLE.size + KEY_DISPLAY_STYLE.margin;

				for (var keyCode in keyMap) {
					var keyDesc = keyMap[keyCode];
					if (keyDesc.index !== playerIndex) {
						continue;
					}

					var label = LABELS[keyCode];
					var dir = keyDesc.dir;
					var off = OFFSETS[dir];

					renderTranslated(context, off.x * step, off.y * step, function(context) {
						KeyDisplay.render(context, label, inputDisplay.highlighted[dir]);
					});
				}
			});
		}
	};
})();