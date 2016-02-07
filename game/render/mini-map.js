var MiniMapRenderer = (function() {
	function renderCell(context, cellValue) {
		if (!cellValue || (cellValue === ' ')) {
			return;
		}

		context.beginPath();

		var sqrt2 = Math.sqrt(2);
		switch (cellValue) {
			case '0':
				context.rect(-0.5, -0.5, 1, 1);
				break;
			case 'X':
				context.rect(-0.5, -0.5, 1, 1);
				context.fill();

				context.beginPath();
				context.moveTo(-0.25 * sqrt2, -0.25 * sqrt2);
				context.lineTo(0.25 * sqrt2, 0.25 * sqrt2);
				context.moveTo(0.25 * sqrt2, -0.25 * sqrt2);
				context.lineTo(-0.25 * sqrt2, 0.25 * sqrt2);
				context.stroke();

				context.beginPath();
				break;
			case 'Y':
				context.rect(-0.5, -0.5, 1, 1);
				context.fill();

				context.beginPath();
				context.arc(0, 0, MINIMAP_STYLE.dotRadius, 0, 2 * Math.PI);
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
	}

	function renderBorder(context, mapSx, mapSy) {
		var style = {
			fill: MINIMAP_STYLE.bg,
			stroke: MINIMAP_STYLE.border,
			lineWidth: MINIMAP_STYLE.lineWidth
		};

		renderTranslated(context, -1.5, -1.5, function(context) {
			PrimitiveRenderer.rect(context, style, vec(mapSx + 2, mapSy + 2));
		});
	}

	return {
		render: function(context, map) {
			var mapSx = map[0].length;
			var mapSy = map.length;

			renderBorder(context, mapSx, mapSy);

			context.fillStyle = MINIMAP_STYLE.fill;
			context.strokeStyle = MINIMAP_STYLE.stroke;
			context.lineWidth = MINIMAP_STYLE.lineWidth;

			renderMap(context, map, 0, 0, mapSx, mapSy, renderCell);
		}
	};
})();