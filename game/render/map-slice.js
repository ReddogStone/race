var MapSlice = (function() {
	var ROAD_SIZE = MAP_ROAD_SIZE / MAP_CELL_SIZE;

	function fillRect(context, x, y, width, height) {
		context.beginPath();
		context.rect(x - 0.5 * width, y - 0.5 * height, width, height);
		context.fill();
	}

	function renderBackgroundCell(context) {
		var off = MAP_STYLE.rasterLineWidth;
		context.fillStyle = MAP_STYLE.bg;
		context.fillRect(-0.5 - off, -0.5 - off, 1 + 2 * off, 1 + 2 * off);
	}

	function renderCrossing(context, map, x, y) {
		var left = map[y][x - 1];
		var right = map[y][x + 1];
		var top = (map[y - 1] || '')[x];
		var bottom = (map[y + 1] || '')[x];

		context.fillStyle = MAP_STYLE.road;

		fillRect(context, 0, 0, ROAD_SIZE, ROAD_SIZE);
		if (left && left !== ' ') {
			fillRect(context, -0.25, 0, 0.5, ROAD_SIZE);
		}
		if (right && right !== ' ') {
			fillRect(context, 0.25, 0, 0.5, ROAD_SIZE);
		}
		if (top && top !== ' ') {
			fillRect(context, 0, -0.25, ROAD_SIZE, 0.5);
		}
		if (bottom && bottom !== ' ') {
			fillRect(context, 0, 0.25, ROAD_SIZE, 0.5);
		}
	}

	function renderCell(context, cellValue, x, y, map) {
		renderBackgroundCell(context);

		switch (cellValue) {
			case '0':
			case 'X':
			case 'Y':
				renderCrossing(context, map, x, y);
				break;
			case '-':
				context.fillStyle = MAP_STYLE.road;
				fillRect(context, 0, 0, 1, ROAD_SIZE);
				break;
			case '|':
				context.fillStyle = MAP_STYLE.road;
				fillRect(context, 0, 0, ROAD_SIZE, 1);
				break;
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
		render: function(context, map) {
			var mapSx = map[0].length;
			var mapSy = map.length;
			renderMap(context, map, -10, -10, mapSx + 20, mapSy + 20, renderCell);
		}
	};
})();