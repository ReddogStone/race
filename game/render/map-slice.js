var MapSlice = function() {
	var FINISH_COLS = 25;
	var FINISH_ROWS = 3;
	var FINISH_CELL_SIZE = MAP_CELL_SIZE / FINISH_COLS;
	var FINISH_FILL = 'black';

	var finishBuffer = document.createElement('canvas');
	finishBuffer.width = MAP_CELL_SIZE;
	finishBuffer.height = FINISH_ROWS * FINISH_CELL_SIZE;

	var finishBufferContext = finishBuffer.getContext('2d');
	finishBufferContext.clearRect(0, 0, finishBuffer.width, finishBuffer.height);
	finishBufferContext.fillStyle = FINISH_FILL;
	for (var y = 0; y < FINISH_ROWS; y++) {
		for (var x = 0; x < FINISH_COLS; x++) {
			if ((x + y) % 2 === 0) {
				finishBufferContext.fillRect(x * FINISH_CELL_SIZE, y * FINISH_CELL_SIZE, FINISH_CELL_SIZE, FINISH_CELL_SIZE);
			}
		}
	}

	var off = MAP_STYLE.rasterLineWidth;

	function fillRect(context, x, y, width, height) {
		context.beginPath();
		context.rect(x - 0.5 * width - off, y - 0.5 * height - off, width + 2 * off, height + 2 * off);
		context.fill();
	}

	function renderFinish(context, rotation) {
		context.rotate(rotation);
		context.drawImage(finishBuffer, -0.5, -0.5, finishBuffer.width / MAP_CELL_SIZE, finishBuffer.height / MAP_CELL_SIZE);
		context.rotate(-rotation);
	}

	function renderRoad(context, map, x, y, isFinish) {
		context.fillStyle = MAP_STYLE.road;
		fillRect(context, 0, 0, 1, 1);

		if (MapLogic.canGo(map, vec(x, y), vec(-1, 0))) {
			if (isFinish) { renderFinish(context, -Math.PI * 0.5); }
		}
		if (MapLogic.canGo(map, vec(x, y), vec(1, 0))) {
			if (isFinish) { renderFinish(context, Math.PI * 0.5); }
		}
		if (MapLogic.canGo(map, vec(x, y), vec(0, -1))) {
			if (isFinish) { renderFinish(context, 0); }
		}
		if (MapLogic.canGo(map, vec(x, y), vec(0, 1))) {
			if (isFinish) { renderFinish(context, Math.PI); }
		}
	}

	function renderCell(context, cellValue, x, y, map) {
		if (cellValue && (cellValue !== ' ')) {
			renderRoad(context, map, x, y, MapLogic.isFinish(cellValue));
		}
	}

	return {
		render: function(context, map, left, top, right, bottom) {
			var mapSx = map[0].length;
			var mapSy = map.length;
			renderMap(context, map, left, top, right, bottom, renderCell);
		}
	};
};