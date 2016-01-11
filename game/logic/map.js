var MapLogic = (function() {
	function getCell(map, x, y) {
		var row = map[y];
		if (!row) { return undefined; }
		return row[x];
	}

	return {
		getStart: function(map) {
			for (var y = 0; y < map.length; y++) {
				var x = map[y].indexOf('X');
				if (x >= 0) {
					return vec(x, y);
				}
			}
		},
		getCell: function(map, pos) {
			return getCell(map, Math.round(pos.x), Math.round(pos.y));
		},
		canTurn: function(map, current, target) {
			return target && (target !== ' ') && ('0XY'.indexOf(current) >= 0);
		}
	};
})();