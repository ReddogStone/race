var MapLogic = (function() {
	function getCell(map, pos) {
		var row = map[Math.round(pos.y)];
		if (!row) { return undefined; }
		return row[Math.round(pos.x)];
	}

	function isCrossing(value) {
		return (value === '0') || (value === 'X') || (value === 'Y');
	}

	function isRegularCrossing(value) {
		return (value === '0');
	}

	function isWall(value) {
		return (value === undefined) || (value === ' ');
	}

	function canTravel(value, dir) {
		return isCrossing(value) || ((dir.x !== 0) && (value === '-')) || ((dir.y !== 0) && (value === '|'));
	}

	function search(map, value) {
		for (var y = 0; y < map.length; y++) {
			var x = map[y].indexOf(value);
			if (x >= 0) {
				return vec(x, y);
			}
		}
	}

	return {
		getStart: function(map) {
			return search(map, 'X');
		},
		getFinish: function(map) {
			return search(map, 'Y');
		},
		getCell: getCell,
		getCellCoords: function(pos) {
			return vec(Math.round(pos.x), Math.round(pos.y));
		},
		canGo: function(map, pos, dir) {
			var current = getCell(map, pos);
			var target = getCell(map, vadd(pos, dir));
			return target && canTravel(current, dir) && canTravel(target, dir);
		},
		getSize: function(map) {
			return vec(map[0].length, map.length);
		},
		getProgress: function(pos, dir) {
			var px = (pos.x % 1);
			var py = (pos.y % 1);
			if (px > 0.5) { px -= 1; }
			if (py > 0.5) { py -= 1; }
			px *= 2;
			py *= 2;
			return vdot(dir, vec(px, py));
		},
		isCrossing: isCrossing,
		isRegularCrossing: isRegularCrossing,
		isWall: isWall
	};
})();