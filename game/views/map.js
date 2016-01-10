var MapView = (function() {
	function drawBorder(context, viewport, color) {
		context.strokeStyle = color;
		context.lineWidth = VIEW_BORDER;

		context.beginPath();
		context.rect(viewport.x, viewport.y, viewport.sx, viewport.sy);
		context.stroke();
	}

	return {
		render: function(context, map, viewport, players) {
			var mainPlayer = players[players.length - 1];

			Camera.viewport(context, viewport.x, viewport.y, viewport.sx, viewport.sy, function(context) {
				renderTranslated(context, mainPlayer.pos.x, mainPlayer.pos.y, function(context) {
					Camera.transform(context, mainPlayer.mapPos, 0, MAP_CELL_SIZE, function(context) {
						MapSlice.render(context, map);

						var anchor = mainPlayer.rect.anchor;
						var mapPos = mainPlayer.mapPos;
						var rotation = mainPlayer.rotation;

						renderTransformed(context, mapPos.x, mapPos.y, rotation, 1, function(context) {
							var speedPercentage = Math.min((mainPlayer.speed + 1) / MAX_PLAYER_SPEED, 1.0);
							PlayerRenderer.withSpeedBar(context, anchor.x, anchor.y, mainPlayer.style, speedPercentage);
						});
					});
				});

				drawBorder(context, viewport, mainPlayer.style.fill);
			});
		}
	};
})();