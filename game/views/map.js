var MapView = (function() {
	function drawBorder(context, viewport, color) {
		context.strokeStyle = color;
		context.lineWidth = VIEW_BORDER;

		context.beginPath();
		context.rect(viewport.x, viewport.y, viewport.sx, viewport.sy);
		context.stroke();
	}

	var ARROW_SIZE = vec(0.3, 0.1);
	var ARROW_PIVOT = vec(1.1, 0.5);

	function drawSpeedArrow(context, pos, dir) {
		var pivot = vmul(ARROW_SIZE, ARROW_PIVOT);
		var p = vadd(pos, vscale(dir, 0.5));
		var rot = Math.atan2(dir.y, dir.x);
		renderPivotTransformed(context, p.x, p.y, rot, 1, pivot.x, pivot.y, function(context) {
			SpeedArrow.render(context, ARROW_SIZE);
		});
	}

	function drawSpeedArrows(context, map, player) {
		var dir = player.dir;
		if (veq(dir, vec(0, 0))) { return; }

		var pos = MapLogic.getCellCoords(player.mapPos);

		if (player.burnedPos && veq(pos, player.burnedPos)) {
			pos = vadd(pos, dir);
		}

		var cell = MapLogic.getCell(map, pos);
		while (!MapLogic.isCrossing(cell) && !MapLogic.isWall(cell)) {
			pos = vadd(pos, dir);
			cell = MapLogic.getCell(map, pos);
		}

		var dirs = [
			vec(-dir.y, dir.x),
			vec(dir.y, -dir.x)
		];
		dirs.filter(function(dir) {
			return MapLogic.canGo(map, pos, dir);
		}).forEach(function(dir) {
			drawSpeedArrow(context, pos, dir);
		});
	}

	return {
		render: function(context, map, viewport, players, offset) {
			var mainPlayer = players[players.length - 1];

			var delta = vscale(vsub(offset, viewport), 1 / MAP_CELL_SIZE);
			var topLeft = vsub(mainPlayer.mapPos, delta);
			var bottomRight = vadd(mainPlayer.mapPos, delta);

			var left = Math.floor(topLeft.x);
			var top = Math.floor(topLeft.y);
			var right = Math.ceil(bottomRight.x) + 1;
			var bottom = Math.ceil(bottomRight.y) + 1;

			CameraRenderer.viewport(context, viewport.x, viewport.y, viewport.sx, viewport.sy, function(context) {
				renderTranslated(context, offset.x, offset.y, function(context) {
					CameraRenderer.transform(context, mainPlayer.mapPos, 0, MAP_CELL_SIZE, function(context) {
						var mapSize = MapLogic.getSize(map);
						MapSlice.render(context, map, left, top, right, bottom);

						drawSpeedArrows(context, map, mainPlayer);

						players.forEach(function(player) {
							var anchor = player.anchor;
							var mapPos = player.mapPos;
							var rotation = player.rotation;

							renderTransformed(context, mapPos.x, mapPos.y, rotation, 1, function(context) {
								if (player === mainPlayer) {
									var speed = player.shownSpeed || 0;
									var speedPercentage = Math.min(speed / MAX_PLAYER_SPEED, 1.0);
									PlayerRenderer.withSpeedBar(context, anchor.x, anchor.y, player.style, speedPercentage);
								} else {
									PlayerRenderer.forMap(context, anchor.x, anchor.y, player.style);
								}
							});
						});
					});
				});

				drawBorder(context, viewport, mainPlayer.style.fill);
			});
		}
	};
})();