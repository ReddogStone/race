var ToBeContinuedScreen = function() {
	return function(event) {
		switch (event.type) {
			case 'show':
				var context = event.context;
				var canvas = context.canvas;

				context.fillStyle = TITLE_BG_COLOR;
				context.fillRect(0, 0, canvas.width, canvas.height);

				renderTranslated(context, canvas.width * 0.5, canvas.height * 0.5, function(context) {
					StringRenderer.render(context, getString('to_be_continued'), 70, MAIN_FONT, 'black', vec(0.5, 0.5));
				});

				break;
			case 'mousedown':
			case 'keydown':
				return {};
		}
	};
}