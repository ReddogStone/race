var MapLogic = (function() {
	function getCell(map, x, y) {
		var row = map[y];
		if (!row) { return undefined; }
		return row[x];
	}

	return {
		getCell: function(map, pos) {
			return getCell(map, Math.round(pos.x), Math.round(pos.y));
		},
		canTurn: function(map, current, target) {
			return target && (target !== ' ') && ('0XY'.indexOf(current) >= 0);
		}
	};
})();