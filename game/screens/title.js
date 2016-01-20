var TitleScreen = function() {
	return function(event) {
		switch (event.type) {
			case 'show':
				var context = event.context;
				var canvas = context.canvas;

				context.fillStyle = MAP_STYLE.road;
				context.fillRect(0, 0, canvas.width, canvas.height);

				renderText(context, {
					pos: vec(0, 100),
					size: vec(context.canvas.width, context.canvas.height),
					text: {
						font: { name: MAIN_FONT, height: 70, lineSpacing: 1.5 },
						message: "{{bold}}{{huge}}{{center}}" + 
							getString('game_title') + "\n" +
							"{{normal}}{{big}}" + 
							getString('game_sub_title')
					}
				});
				break;
			case 'mousedown':
				return {};
		}
	};
}