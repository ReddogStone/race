var LanguageSelectionScreen = function() {
	var DISTANCE = 100;
	var LANGUAGES = [
		{ id: 'en-us', display: 'English' },
		{ id: 'de', display: 'Deutsch' },
		{ id: 'ru', display: 'Русский' }
	];
	var COLORS = {};
	COLORS[MouseInputArea.DEFAULT] = BUTTON_STYLE.default;
	COLORS[MouseInputArea.HIGHLIGHTED] = BUTTON_STYLE.highlighted;
	COLORS[MouseInputArea.PRESSED] = BUTTON_STYLE.pressed;

	var ANCHOR = vec(0.5, 0.5);

	var languageButtons = LANGUAGES.map(function(lang, index) {
		return {
			pos: vec(640, 360 - (0.5 * (LANGUAGES.length - 1) - index) * DISTANCE),
			size: vec(280, 0.5 * DISTANCE),
			languageId: lang.id,
			display: lang.display,
			state: MouseInputArea.DEFAULT
		};
	});

	var clickBehaviors = languageButtons.map(function(button) {
		inputArea = MouseInputArea(button.pos, button.size, ANCHOR);
		var waitForClick = inputArea(function(state) { button.state = state; });
		return Behavior.run(function*() {
			yield waitForClick;
			return button.languageId;
		});
	});
	var behavior = Behavior.first(clickBehaviors);

	return function(event) {
		if (event.type === 'show') {
			var context = event.context;
			var canvas = context.canvas;

			context.fillStyle = TITLE_BG_COLOR;
			context.fillRect(0, 0, canvas.width, canvas.height);

			languageButtons.forEach(function(button) {
				var color = COLORS[button.state];
				renderTranslated(context, button.pos.x, button.pos.y, function(context) {
					StringRenderer.render(context, button.display, 0.5 * DISTANCE, MAIN_FONT, color, ANCHOR);
				});
			});
		} else {
			var result = behavior(event);
			if (result.done) {
				return result;
			}
		}
	};
}