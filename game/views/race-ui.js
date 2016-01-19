var RaceUi = function(sceneDescriptions) {
	var winMessageBox = null;

	return {
		beforeStart: function() {

		},
		onStart: function() {
		},
		onWin: function(player, time) {
			winMessageBox = {
				color: player.style.stroke,
				lines: [
					player.name + " FINISHED",
					time.toFixed(2) + 's'
				]
			};

			return Behavior.interval(1, function(progress) {
				winMessageBox.scale = progress;
			});
		},
		render: function(context) {
			var canvas = context.canvas;

			if (winMessageBox) {
				var color = winMessageBox.color;
				var scale = winMessageBox.scale;
				var height = scale * WIN_MESSAGE_FONT_SIZE;

				renderTranslated(context, 0.5 * canvas.width, 0.5 * canvas.height, function(context) {
					var rectSize = vscale(vec(1000, 400), scale);
					renderTranslated(context, -0.5 * rectSize.x, -0.5 * rectSize.y, function(context) {
						PrimitiveRenderer.rect(context, WIN_BG_STYLE, rectSize);
					});

					renderTranslated(context, 0, -0.7 * height, function(context) {
						renderString(context, winMessageBox.lines[0], height, MAIN_FONT, color, vec(0.5, 0.5));
					});
					renderTranslated(context, 0, 0.7 * height, function(context) {
						renderString(context, winMessageBox.lines[1], height, MAIN_FONT, color, vec(0.5, 0.5));
					});
				});
			}
		}
	};
};