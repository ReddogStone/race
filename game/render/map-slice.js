var MapSlice = (function() {
	function fillRect(context, x, y, width, height) {
		context.beginPath();
		context.rect(x - 0.5 * width, y - 0.5 * height, width, height);
		context.fill();

		// context.strokeStyle = 'red';
		// context.stroke();
	}

	function drawBg(context, x, y) {
		context.fillStyle = MAP_STYLE.bg;
		fillRect(context, x - 0.5, y - 0.5, MAP_CELL_SIZE + 1, MAP_CELL_SIZE + 1);
	}

	function drawCrossing(context, map, x, y, offX, offY) {
		var left = map[y][x - 1];
		var right = map[y][x + 1];
		var top = (map[y - 1] || '')[x];
		var bottom = (map[y + 1] || '')[x];

		drawBg(context, offX, offY);

		context.fillStyle = MAP_STYLE.road;
		fillRect(context, offX, offY, MAP_ROAD_SIZE, MAP_ROAD_SIZE);
		if (left && left !== ' ') {
			fillRect(context, offX - 0.25 * MAP_CELL_SIZE, offY, MAP_CELL_SIZE * 0.5, MAP_ROAD_SIZE);
		}
		if (right && right !== ' ') {
			fillRect(context, offX + 0.25 * MAP_CELL_SIZE, offY, MAP_CELL_SIZE * 0.5, MAP_ROAD_SIZE);
		}
		if (top && top !== ' ') {
			fillRect(context, offX, offY - 0.25 * MAP_CELL_SIZE, MAP_ROAD_SIZE, MAP_CELL_SIZE * 0.5);
		}
		if (bottom && bottom !== ' ') {
			fillRect(context, offX, offY + 0.25 * MAP_CELL_SIZE, MAP_ROAD_SIZE, MAP_CELL_SIZE * 0.5);
		}
	}

	return {
		renderPlayer: function(context, center, offX, offY, width, height, entity) {
			context.save();
			context.translate(offX, offY);

			context.beginPath();
			context.rect(0, 0, width, height);
			context.clip();

			var pp = vadd(center, vec(0.5, 0.5));
			var topLeft = vsub(pp, vscale(vec(width, height), 0.5 / MAP_CELL_SIZE));
			var relative = vsub(entity.mapPos, topLeft);

			var x = (relative.x + 0.5) * MAP_CELL_SIZE;
			var y = (relative.y + 0.5) * MAP_CELL_SIZE;

			context.fillStyle = entity.style.fill;
			context.strokeStyle = entity.style.stroke;
			context.lineWidth = entity.style.lineWidth;

			context.beginPath();
			context.rect(x - 80 * 0.9, y - 20, 80, 40);
			context.fill();
			context.stroke();

			context.restore();
		},
		render: function(context, map, playerPos, offX, offY, width, height, color) {
			// context.fillStyle = MAP_STYLE.fill;
			// context.strokeStyle = MINIMAP_STYLE.stroke;
			// context.lineWidth = MINIMAP_STYLE.lineWidth;

			context.save();
			context.translate(offX, offY);

			context.beginPath();
			context.rect(0, 0, width, height);
			context.clip();

			var pp = vadd(playerPos, vec(0.5, 0.5));
			var topLeft = vsub(pp, vscale(vec(width, height), 0.5 / MAP_CELL_SIZE));
			var bottomRight = vadd(pp, vscale(vec(width, height), 0.5 / MAP_CELL_SIZE));

			var left = Math.floor(topLeft.x);
			var right = Math.floor(bottomRight.x);
			var top = Math.floor(topLeft.y);
			var bottom = Math.floor(bottomRight.y);

			for (var y = top; y <= bottom; y++) {
				var row = map[y];
				for (var x = left; x <= right; x++) {
					var value = row && row[x];

					var posX = (x + 0.5 - topLeft.x) * MAP_CELL_SIZE;
					var posY = (y + 0.5 - topLeft.y) * MAP_CELL_SIZE;

					if (value === undefined) {
						drawBg(context, posX, posY);
					}

					switch (value) {
						case '0':
						case 'X':
						case 'Y':
							drawCrossing(context, map, x, y, posX, posY);
							break;
						case '-':
							drawBg(context, posX, posY);
							context.fillStyle = MAP_STYLE.road;
							fillRect(context, posX, posY, MAP_CELL_SIZE, MAP_ROAD_SIZE);
							break;
						case '|':
							drawBg(context, posX, posY);
							context.fillStyle = MAP_STYLE.road;
							fillRect(context, posX, posY, MAP_ROAD_SIZE, MAP_CELL_SIZE);
							break;
						case ' ':
							drawBg(context, posX, posY);
							break;
					}
				}
			}

			context.strokeStyle = color;
			context.lineWidth = 10;

			context.beginPath();
			context.rect(0, 0, width, height);
			context.stroke();

			context.restore();
		}
	};
})();