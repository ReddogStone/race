var renderString = (function() {
	function showText(context, message, size, font, color) {
		var withoutCommands = message.replace(/{{[^}]}}/g, '');
		var charsToShow = Math.floor(withoutCommands.length * progress);

		var state = {
			style: 'normal',
			heightMultiplier: 1,
			align: 'left',
			color: color
		};

		var i = 0;

		var y = 0;
		var line = '';
		do {
			if (charsToShow > 0) {
				if (i < message.length) {
					do {
						var lastIndex = i;
						i = applyCommand(state, message, i);
					} while (i > lastIndex);

					if (i >= message.length) { break; }
				}

				var height = Math.floor(font.height * state.heightMultiplier);
				context.font = state.style + ' ' + height + 'px ' + font.name;

				if (i < message.length) {
					var c = message.charAt(i);
					i++;

					if (c !== '\n') {
						var width = context.measureText(line + c).width;
						if (width < size.x) {
							line += c;
							charsToShow--;
							continue;
						}

						i--;
					}
				} else {
					i++;
				}
			}

			context.fillStyle = state.color;
			context.textAlign = state.align;
			context.textBaseline = 'top';

			var x = 0;
			switch (context.textAlign) {
				case 'right': x = size.x; break;
				case 'center': x = 0.5 * size.x; break;
			}

			context.fillText(line, x, y);

			line = '';
			y += height * font.lineSpacing;

			if (charsToShow <= 0) { break; }
		} while (i <= message.length);
	}

	return function(context, string, height, fontName, color, anchor) {
		anchor = anchor || vec(0.5, 0.5);

		context.fillStyle = color;
		context.font = height + 'px ' + fontName;
		context.textAlign = 'left';
		context.textBaseline = 'top';

		var width = context.measureText(string).width;

		renderTranslated(context, -anchor.x * width, -anchor.y * height, function(context) {
/*			context.lineWidth = 1;
			context.beginPath();
			context.rect(0, 0, width, height);
			context.stroke(); */

			context.fillText(string, 0, 0);
		});
	};
})();
