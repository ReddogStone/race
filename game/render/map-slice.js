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
		if (MapLogic.canGo(map, vec(x, y), vec(-1, 0))) {
			fillRect(context, -0.25, 0, 0.5, ROAD_SIZE);
		}
		if (MapLogic.canGo(map, vec(x, y), vec(1, 0))) {
			fillRect(context, 0.25, 0, 0.5, ROAD_SIZE);
		}
		if (MapLogic.canGo(map, vec(x, y), vec(0, -1))) {
			fillRect(context, 0, -0.25, ROAD_SIZE, 0.5);
		}
		if (MapLogic.canGo(map, vec(x, y), vec(0, 1))) {
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
		render: function(context, map) {
			var mapSx = map[0].length;
			var mapSy = map.length;
			renderMap(context, map, -10, -10, mapSx + 20, mapSy + 20, renderCell);
		}
	};
})();