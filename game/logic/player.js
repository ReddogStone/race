var PlayerLogic = function(behaviorSystem) {
	function increaseSpeed(player) {
		player.speed++;
	}

	function turn(player, newRotation) {
		console.log(player.rotation, newRotation);

		if (player.cancelToMiddle) {
			player.cancelToMiddle();
		}

		var rot = player.rotation;

		if (Math.abs(newRotation - rot) > Math.PI) {
			if (rot < 0) {
				rot += 2 * Math.PI;
			} else {
				rot -= 2 * Math.PI;
			}
		}
		behaviorSystem.add(Behavior.interval(TURN_TIME, function(progress) {
			player.rotation = lerp(rot, newRotation, progress);
		}));

		var dim = (player.dir.x !== 0) ? 'y' : 'x';
		var start = player.mapPos[dim];
		var end = Math.round(start);
		behaviorSystem.add(Behavior.interval(TURN_TIME, function(progress) {
			player.mapPos[dim] = lerp(start, end, progress);
		}));
	}

	function toMiddle(player, duration) {
		var playerPos = vclone(player.mapPos);
		var target = vec(Math.round(playerPos.x), Math.round(playerPos.y));
		player.cancelToMiddle = behaviorSystem.add(Behavior.interval(duration, function(progress) {
			var a = Math.sin((progress) * 0.5 * Math.PI);
			player.mapPos = vlerp(playerPos, target, a);
		}));
	}

	function onWin(player) {
		player.dir = vec(0, 0);
		toMiddle(player, 1);
	}

	return {
		init: function(player, initialPos) {
			player.mapPos = vclone(initialPos);
			player.rotation = 0;
			player.speed = 0;
			player.dir = vec(0, 0);
		},
		update: function(map, player, dt) {
			var delta = vscale(player.dir, dt * (PLAYER_BASE_SPEED + PLAYER_SPEED_SCALE * player.speed));
			player.mapPos = vadd(player.mapPos, delta);

			var value = MapLogic.getCell(map, player.mapPos);
			if (value === 'Y') {
				onWin(player);
				return true;
			}

			var dir = player.dir;
			var mapPos = player.mapPos;

			var px = (mapPos.x % 1);
			var py = (mapPos.y % 1);
			if (px > 0.5) { px -= 1; }
			if (py > 0.5) { py -= 1; }
			px *= 2;
			py *= 2;
			var progress = dir.x * px + dir.y * py;
			if (!MapLogic.canGo(map, mapPos, dir) && (progress > MAP_ROAD_SIZE / MAP_CELL_SIZE)) {
				toMiddle(player, 1);

				player.burnedPos = null;

				player.dir = vec(0, 0);
				player.speed = 0;
			}

			var pos = vclone(player.mapPos);
			pos.x = Math.round(pos.x);
			pos.y = Math.round(pos.y);

			if (player.burnedPos && !veq(pos, player.burnedPos)) {
				player.burnedPos = null;
			}

			return false;
		},		
		handleInput: function(map, player, newDir) {
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
		}
	};
}