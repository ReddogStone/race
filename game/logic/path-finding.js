var PathFinding = (function() {
	function part(prev, pos, dir, v, t) {
		return {
			prev: prev,
			pos: vclone(pos),
			dir: vclone(dir),
			v: v,
			t: t
		};
	}

	function fromStanding(map, pos) {
		
	}

	function initialParts(map, pos, dir, v) {
		if ((dir.x === 0) && (dir.y === 0)) {
			return fromStanding(map, pos);
		} else {
			var start = part(null, pos, dir, v, 0);

			var targetCoords = MapLogic.getCellCoords(vadd(pos, dir));
			var target = MapLogic.getCell(targetCoords);
			if (target === ' ') {
				return fromStanding(map, MapLogic.getCellCoords(pos));
			}

			var dist = vdot(vsub(targetCoords, pos), dir) - 0.5;
			return [part(start, targetCoords, dir, v, dist / v)];
		}
	}

	return {
		shortest: function(map, initPos, initDir, initV) {
			var fifo = [];

		}
	};
})();