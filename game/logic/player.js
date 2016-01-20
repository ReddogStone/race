var PlayerLogic = function(behaviorSystem) {
	function increaseSpeed(player) {
		var newSpeed = Math.min(player.speed + 1, MAX_PLAYER_SPEED);
		player.shownSpeed = newSpeed;

		behaviorSystem.add(Behavior.interval(TURN_TIME, function(progress) {
			player.speed = progress * newSpeed;
		}));
	}

	function turn(player, newRotation) {
		if (player.cancelMove) {
			player.cancelMove();
		}

		var rot = player.rotation;

		if (Math.abs(newRotation - rot) > Math.PI) {
			if (rot < 0) {
				rot += 2 * Math.PI;
			} else {
				rot -= 2 * Math.PI;
			}
		}

		var dim = (player.dir.x !== 0) ? 'y' : 'x';
		var start = player.mapPos[dim];
		var end = Math.round(start);

		behaviorSystem.add(Behavior.interval(TURN_TIME, function(progress) {
			player.mapPos[dim] = lerp(start, end, progress);
			player.rotation = lerp(rot, newRotation, progress);
		}));
	}

	function forceMovePlayer(player, from, to, duration) {
		if (player.cancelMove) {
			player.cancelMove();
		}

		var start = vclone(from);
		var finish = vclone(to);

		player.cancelMove = behaviorSystem.add(Behavior.run(function*() {
			yield Behavior.interval(duration, function(progress) {
				var a = Math.sin((progress) * 0.5 * Math.PI);
				player.mapPos = vlerp(start, finish, a);
			});
			player.blocked = false;
		}));
	}

	function toMiddle(player, duration) {
		forceMovePlayer(player, player.mapPos, MapLogic.getCellCoords(player.mapPos), duration);
	}

	function backOff(player, amount, duration) {
		player.blocked = true;
		forceMovePlayer(player, player.mapPos, vsub(player.mapPos, vscale(player.dir, amount)), duration);
	}

	function onWin(player) {
		player.dir = vec(0, 0);
		toMiddle(player, 1);
	}

	function move(player, dt) {
		var delta = vscale(player.dir, dt * (PLAYER_BASE_SPEED + PLAYER_SPEED_SCALE * player.speed));
		player.mapPos = vadd(player.mapPos, delta);
	}

	function checkWin(map, player) {
		var value = MapLogic.getCell(map, player.mapPos);
		return (value === 'Y');
	}

	function halt(player) {
		player.burnedPos = null;
		player.dir = vec(0, 0);
		player.speed = 0;
	}

	function collideWithWalls(map, player) {
		var dir = player.dir;
		var mapPos = player.mapPos;

		var progress = MapLogic.getProgress(mapPos, dir);
		if (!MapLogic.canGo(map, mapPos, dir) && (progress > MAP_ROAD_SIZE / MAP_CELL_SIZE)) {
			toMiddle(player, 1);
			player.burnedPos = null;
			player.dir = vec(0, 0);
			player.speed = Math.max(player.speed - 2, 0);
			player.shownSpeed = player.speed;
		}
	}

	function handleBurnedPos(player) {
		var pos = MapLogic.getCellCoords(player.mapPos);
		if (player.burnedPos && !veq(pos, player.burnedPos)) {
			player.burnedPos = null;
		}
	}

	return {
		init: function(player, initialPos) {
			player.mapPos = vclone(initialPos);
			player.rotation = 0;
			player.speed = 0;
			player.dir = vec(0, 0);
		},
		update: function(map, player, dt) {
			move(player, dt);

			if (checkWin(map, player)) {
				onWin(player);
				return true;
			}

			collideWithWalls(map, player);
			handleBurnedPos(player);

			return false;
		},		
		handleInput: function(map, player, newDir) {
			if (player.blocked) { return; }

			var pos = vclone(player.mapPos);
			pos.x = Math.round(pos.x);
			pos.y = Math.round(pos.y);

			if (player.burnedPos && veq(pos, player.burnedPos)) {
				return;
			}

			if (newDir.x * player.dir.x === -1 || newDir.y * player.dir.y === -1 || veq(player.dir, newDir)) {
				return;
			}

			if (MapLogic.canGo(map, player.mapPos, newDir)) {
				player.dir = newDir;

				turn(player, Math.atan2(newDir.y, newDir.x));
				increaseSpeed(player);

				player.burnedPos = pos;

				return true;
			}

			return false;
		},
		toMiddle: toMiddle,
		backOff: backOff,
		halt: halt
	};
}