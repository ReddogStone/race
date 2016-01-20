var RaceUi = function(sceneDescriptions) {
	var winMessageBox = null;
	var startMessageBox = null;

	return {
		showStartMessage: function(title, message) {
			startMessageBox = {
				title: title,
				message: message
			};
			return Behavior.run(function*() {
				yield Behavior.interval(1, function(progress) {
					startMessageBox.scale = progress;
				});

				yield Behavior.type('mousedown');

				startMessageBox = null;
			});
		},
		beforeStart: function() {

		},
		onStart: function() {
		},
		onWin: function(player, time) {
			winMessageBox = {
				color: player.style.stroke,
				lines: [
					getString('finish_msg', player.name),
					time.toFixed(2) + getString('seconds')
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
						StringRenderer.render(context, winMessageBox.lines[0], height, MAIN_FONT, color, vec(0.5, 0.5));
					});
					renderTranslated(context, 0, 0.7 * height, function(context) {
						StringRenderer.render(context, winMessageBox.lines[1], height, MAIN_FONT, color, vec(0.5, 0.5));
					});
				});
			}

			if (startMessageBox) {
				var color = START_MESSAGE_BOX_STYLE.textColor;
				var scale = startMessageBox.scale;
				var titleHeight = scale * START_MESSAGE_BOX_STYLE.titleFontSize;
				var messageHeight = scale * START_MESSAGE_BOX_STYLE.messageFontSize;

				renderTranslated(context, 0.5 * canvas.width, 0.5 * canvas.height, function(context) {
					var rectSize = vscale(vec(1000, 400), scale);
					renderTranslated(context, -0.5 * rectSize.x, -0.5 * rectSize.y, function(context) {
						PrimitiveRenderer.rect(context, WIN_BG_STYLE, rectSize);
					});

					var y = -0.5 * (rectSize.y) + scale * 30;
					renderTranslated(context, 0, y, function(context) {
						StringRenderer.render(context, startMessageBox.title, titleHeight, MAIN_FONT, color, vec(0.5, 0));
					});
					y += titleHeight + messageHeight;

					var words = startMessageBox.message.split(' ').map(function(word, index) {
						return {
							value: word,
							width: StringRenderer.getWidth(context, (index > 0 ? ' ' : '') + word, messageHeight, MAIN_FONT)
						};
					});

					var lines = [];
					var lineWidth = words[0].width;
					var currentLine = words[0].value;
					var margin = scale * 60;
					for (var i = 1; i < words.length; i++) {
						var word = words[i];
						if ((lineWidth + word.width) < (rectSize.x - margin)) {
							currentLine += ' ' + word.value;
							lineWidth += word.width;
						} else {
							lines.push(currentLine);
							currentLine = word.value;
							lineWidth = word.width;
						}
					}
					lines.push(currentLine);

					lines.forEach(function(line) {
						renderTranslated(context, -0.5 * (rectSize.x - margin), y, function(context) {
							StringRenderer.render(context, line, messageHeight, MAIN_FONT, color, vec(0, 0));
						});
						y += messageHeight * 1.2;
					});
				});
			}			
		}
	};
};