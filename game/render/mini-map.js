var MiniMapRenderer = (function() {
	return {
		render: function(context, map) {
			var mapSx = map[0].length;
			var mapSy = map.length;

			context.fillStyle = MINIMAP_STYLE.bg;
			context.strokeStyle = MINIMAP_STYLE.border;
			context.lineWidth = MINIMAP_STYLE.lineWidth;

			renderTranslated(context, -1.5, -1.5, function(context) {
				context.beginPath();
				context.rect(0, 0, mapSx + 2, mapSy + 2);
				context.fill();
				context.stroke();
			});

			context.fillStyle = MINIMAP_STYLE.fill;
			context.strokeStyle = MINIMAP_STYLE.stroke;
			context.lineWidth = MINIMAP_STYLE.lineWidth;

			renderMap(context, map, 0, 0, mapSx, mapSy, function(context, cellValue) {
				if (!cellValue || (cellValue === ' ')) {
					return;
				}

				context.beginPath();

				var sqrt2 = Math.sqrt(2);
				switch (cellValue) {
					case '0':
						context.arc(0, 0, MINIMAP_STYLE.dotRadius, 0, 2 * Math.PI);
						break;
					case 'X':
						context.arc(0, 0, MINIMAP_STYLE.outerRadius, 0, 2 * Math.PI);
						context.moveTo(-0.25 * sqrt2, -0.25 * sqrt2);
						context.lineTo(0.25 * sqrt2, 0.25 * sqrt2);
						context.moveTo(0.25 * sqrt2, -0.25 * sqrt2);
						context.lineTo(-0.25 * sqrt2, 0.25 * sqrt2);
						break;
					case 'Y':
						context.arc(0, 0, MINIMAP_STYLE.dotRadius, 0, 2 * Math.PI);
						context.fill();
						context.stroke();

						context.beginPath();
						context.arc(0, 0, MINIMAP_STYLE.outerRadius, 0, 2 * Math.PI);
						context.stroke();

						context.beginPath();
						break;
					case '-':
						context.moveTo(-0.5, 0);
						context.lineTo(0.5, 0);
						break;
					case '|':
						context.moveTo(0, -0.5);
						context.lineTo(0, 0.5);
						break;
				}

				context.fill();
				context.stroke();
			});
		}
	};
})();