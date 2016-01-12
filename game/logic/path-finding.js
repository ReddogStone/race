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
		var p = MapLogic.getCellCoords(pos);

		var v = PLAYER_BASE_SPEED;

		var start = part(null, p, vec(0, 0), 0, 0);

		var dirs = [vec(1, 0), vec(-1, 0), vec(0, 1), vec(0, -1)];
		return dirs.filter(function(dir) {
			return MapLogic.canGo(map, p, dir);
		}).map(function(dir) {
			return part(start, vadd(p, dir), dir, v, 0.5 / v);
		});
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

	function turnLeft(dir) {
		return vec(dir.y, -dir.x);
	}
	function turnRight(dir) {
		return vec(-dir.y, dir.x);
	}

	function dist(pos1, pos2) {
		return Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y);
	}

	function partEqual(part1, part2) {
		return veq(part1.pos, part2.pos) && veq(part1.dir, part2.dir);
	}

	function push(fifo, next) {
		for (var i = fifo.length - 1; i >= 0; i--) {
			var p = fifo[i];
			if (partEqual(p, next)) {
				if ((next.t < p.t)) {
					fifo.splice(i, 1);
				} else {
					return;
				}
			}
		}

		fifo.push(next);
	}

	return {
		shortest: function(map, initPos, initDir, initV) {
			var fifo = initialParts(map, initPos, initDir, initV);

			var finish = MapLogic.getFinish(map);
			var shortest = null;

			var step = 0;

			while (fifo.length > 0) {
				var current = fifo.shift();

				if (shortest && (current.t >= shortest.t)) { continue; }

				var cell = MapLogic.getCell(map, current.pos);
				if (cell === 'Y') {
					shortest = current;
					continue;
				}

				if (MapLogic.canGo(map, current.pos, current.dir)) {
					var t = current.t + 1 / current.v;
					if (!shortest || (shortest.t > t)) {
						push(fifo, part(current, vadd(current.pos, current.dir), current.dir, current.v, t));
					}
				}

				var dirs = [turnLeft(current.dir), turnRight(current.dir)];
				dirs.filter(function(dir) {
					return MapLogic.canGo(map, current.pos, dir);
				}).forEach(function(dir) {
					var v = Math.min(current.v + PLAYER_SPEED_SCALE, PLAYER_BASE_SPEED + MAX_PLAYER_SPEED * PLAYER_SPEED_SCALE);
					var t = current.t + Math.sqrt(TURN_TIME / v);
					push(fifo, part(current, vadd(current.pos, dir), dir, v, t));
				});

				if (step++ > 100000) {
					console.log('Pathfinding took too long');
					break;
				}
			}

			var result = [];
			while (shortest) {
				result.unshift(shortest.pos);
				shortest = shortest.prev;
			}

			return result;
		}
	};
})();