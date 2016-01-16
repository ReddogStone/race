var AiSystem = function(playerLogic) {
	var shortestPath = [];

	function setPath(map, aiPlayer) {
/*		shortestPath = [
			startPos,
			vec(3, 4),
			vec(3, 1),
			vec(7, 1),
			vec(7, 4),
			vec(7, 7),
			vec(11, 7),
			vec(11, 4),
			vec(20, 4),
		]; */

		shortestPath = PathFinding.shortest(map, aiPlayer.mapPos, vec(0, 0), 0);
	}

	return {
		update: function(map, aiPlayer, roundStart) {
			if ((roundStart === 0) || ((Time.now() - roundStart) < 0.5)) { return; }
			var forceStart = false;

			if (veq(aiPlayer.dir, vec(0, 0))) {
				setPath(map, aiPlayer);
				forceStart = true;
			}

			if (shortestPath.length < 2) { return; }

			var next = shortestPath[0];

			var pos = MapLogic.getCellCoords(aiPlayer.mapPos);
			if (veq(pos, next)) {
				var progress = MapLogic.getProgress(aiPlayer.mapPos, aiPlayer.dir);
				if (!forceStart && (progress < -0.8)) { return; }

				var dir = vnorm(vsub(shortestPath[1], next));
				playerLogic.handleInput(map, aiPlayer, dir);

				shortestPath.shift();
			}
		}
	};
};