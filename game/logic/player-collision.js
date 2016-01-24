var PlayerCollision = function(playerLogic) {
	function backOffAndHalt(player) {
		playerLogic.backOff(player, 0.2, 1);
		playerLogic.halt(player);
	}

	function collideWithPlayer(player1, player2, dt) {
		var dist = vdist(player1.mapPos, player2.mapPos);
		var delta = vsub(player2.mapPos, player1.mapPos);
		var dirDist = vdot(delta, player1.dir);
		if (dirDist <= 0) { return; }

		var dot = vdot(player1.dir, player2.dir);
		if (dot === -1) {
			if (dist > PLAYER_GEOMETRY.size) { return; }

			backOffAndHalt(player1);
			backOffAndHalt(player2);
		} else if (dot === 0) {
			if (dist > 2 * PLAYER_GEOMETRY.size) { return; }

			backOffAndHalt(player1);
		} else if ((dot === 1) && (player1.speed > player2.speed)) {
			if (dist > 4 * PLAYER_GEOMETRY.size) { return; }
			player1.speed -= (PLAYER_DECCELERATION / dirDist) * dt;
		}
	}

	return {
		update: function(players, dt) {
			players.filter(function(entity) {
				return !veq(entity.dir, vec(0, 0));
			}).forEach(function(first) {
				players.filter(function(second) {
					return second !== first;
				}).forEach(function(second) {
					collideWithPlayer(first, second, dt);
				});
			});
		}
	};
}