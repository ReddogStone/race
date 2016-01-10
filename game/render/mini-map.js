var MiniMap = (function() {
	return {
		renderPlayer: function(context, mapPos, playerPos, style) {
			var posX = mapPos.x + (playerPos.x + 0.5) * MINIMAP_CELL_SIZE;
			var posY = mapPos.y + (playerPos.y + 0.5) * MINIMAP_CELL_SIZE;

			context.fillStyle = style.fill;
			context.strokeStyle = style.stroke;
			context.lineWidth = style.lineWidth;

			context.beginPath();
			context.arc(posX, posY, MINIMAP_STYLE.dotRadius, 0, 2 * Math.PI);
			context.fill();
			context.stroke();
		},
		render: function(context, map, pos) {
			context.fillStyle = MINIMAP_STYLE.bg;
			context.strokeStyle = MINIMAP_STYLE.border;
			context.lineWidth = MINIMAP_STYLE.lineWidth;

			context.beginPath();
			context.rect(pos.x - MINIMAP_CELL_SIZE, pos.y - MINIMAP_CELL_SIZE,
				MINIMAP_CELL_SIZE * (map[0].length + 2), MINIMAP_CELL_SIZE * (map.length + 2));
			context.fill();
			context.stroke();

			context.fillStyle = MINIMAP_STYLE.fill;
			context.strokeStyle = MINIMAP_STYLE.stroke;
			context.lineWidth = MINIMAP_STYLE.lineWidth;

			for (var y = 0; y < map.length; y++) {
				var row = map[y];

				for (var x = 0; x < row.length; x++) {
					var value = row[x];

					var posX = pos.x + (x + 0.5) * MINIMAP_CELL_SIZE;
					var posY = pos.y + (y + 0.5) * MINIMAP_CELL_SIZE;

					context.beginPath();
					switch (value) {
						case '0':
						case 'X':
						case 'Y':
							context.arc(posX, posY, MINIMAP_STYLE.dotRadius, 0, 2 * Math.PI);
							break;
						case '-':
							context.moveTo(posX - MINIMAP_CELL_SIZE * 0.5, posY);
							context.lineTo(posX + MINIMAP_CELL_SIZE * 0.5, posY);
							break;
						case '|':
							context.moveTo(posX, posY - MINIMAP_CELL_SIZE * 0.5);
							context.lineTo(posX, posY + MINIMAP_CELL_SIZE * 0.5);
							break;
					}
					context.fill();
					context.stroke();
				}
			}
		}
	};
})();