var MapView = (function() {
	function drawBorder(context, viewport, color) {
		context.strokeStyle = color;
		context.lineWidth = VIEW_BORDER;

		context.beginPath();
		context.rect(viewport.x, viewport.y, viewport.sx, viewport.sy);
		context.stroke();
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

						players.forEach(function(player) {
							var anchor = player.anchor;
							var mapPos = player.mapPos;
							var rotation = player.rotation;

							renderTransformed(context, mapPos.x, mapPos.y, rotation, 1, function(context) {
								if (player === mainPlayer) {
									var speedPercentage = Math.min((player.speed + 1) / MAX_PLAYER_SPEED, 1.0);
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