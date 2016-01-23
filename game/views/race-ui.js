var RaceUi = function() {
	var endMessageBox = null;
	var startMessageBox = null;

	function showEndMessageBox(color, lines) {
		endMessageBox = {
			color: color,
			lines: lines,
			scale: 0
		};
		return Behavior.run(function*() {
			yield Behavior.interval(1, function(progress) {
				endMessageBox.scale = progress;
			});
			yield Behavior.first(Behavior.type('keydown'), Behavior.type('mousedown'));
			endMessageBox = null;			
		});
	}

	return {
		showStartMessage: function(title, message) {
			startMessageBox = {
				title: title,
				message: message,
				textAlpha: 0,
				boxAlpha: 1
			};
			return Behavior.run(function*() {
				yield Behavior.until(
					Behavior.interval(1, function(progress) {
						startMessageBox.textAlpha = progress;
					}),
					Behavior.waitFor(function(event) {
						return (event.type === 'mousedown') || (event.type === 'keydown');
					})
				);

				var textAlpha = startMessageBox.textAlpha;
				yield Behavior.interval(0.5, function(progress) {
					startMessageBox.textAlpha = lerp(textAlpha, 0, progress);
					startMessageBox.boxAlpha = 1 - progress;
				});

				startMessageBox = null;
			});
		},
		beforeStart: function() {

		},
		onStart: function() {
		},
		onWin: function(player, time) {
			return showEndMessageBox(player.style.stroke, [
				getString('finish_msg', player.name),
				time.toFixed(2) + getString('seconds')
			]);
		},
		onLose: function() {
			return showEndMessageBox(PLAYER_STYLE.stroke, [
				getString('lose_msg'),
				getString('try_again')
			]);
		},
		render: function(context) {
			var canvas = context.canvas;

			if (endMessageBox) {
				var color = endMessageBox.color;
				var scale = endMessageBox.scale;
				var height = scale * WIN_MESSAGE_FONT_SIZE;

				renderTranslated(context, 0.5 * canvas.width, 0.5 * canvas.height, function(context) {
					var rectSize = vscale(vec(1000, 400), scale);
					renderTranslated(context, -0.5 * rectSize.x, -0.5 * rectSize.y, function(context) {
						PrimitiveRenderer.rect(context, WIN_BG_STYLE, rectSize);
					});

					renderTranslated(context, 0, -0.7 * height, function(context) {
						StringRenderer.render(context, endMessageBox.lines[0], height, MAIN_FONT, color, vec(0.5, 0.5));
					});
					renderTranslated(context, 0, 0.7 * height, function(context) {
						StringRenderer.render(context, endMessageBox.lines[1], height, MAIN_FONT, color, vec(0.5, 0.5));
					});
				});
			}

			if (startMessageBox) {
				var color = START_MESSAGE_BOX_STYLE.textColor;
				var scale = 1;
				var titleHeight = scale * START_MESSAGE_BOX_STYLE.titleFontSize;
				var messageHeight = scale * START_MESSAGE_BOX_STYLE.messageFontSize;

				renderTranslated(context, 0.5 * canvas.width, 0.5 * canvas.height, function(context) {
					context.globalAlpha = startMessageBox.boxAlpha;

					var rectSize = vscale(vec(1000, 400), scale);
					renderTranslated(context, -0.5 * rectSize.x, -0.5 * rectSize.y, function(context) {
						PrimitiveRenderer.rect(context, WIN_BG_STYLE, rectSize);
					});

					context.globalAlpha = startMessageBox.textAlpha;

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

					context.globalAlpha = 1;
				});
			}			
		}
	};
};