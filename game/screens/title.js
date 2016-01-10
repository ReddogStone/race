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
						font: { name: 'consolas', height: 70, lineSpacing: 1.5 },
						message: "{{bold}}{{huge}}{{center}}" + 
							"THE RACE\n" +
							"{{normal}}{{big}}" + 
							"On the Wall\n" +
							"{{tiny}}(This is a lie)"
					}
				});
				break;
			case 'mousedown':
				return {};
		}
	};
}