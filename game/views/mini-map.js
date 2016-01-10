var MiniMapView = (function() {
	return {
		render: function(context, map, players, offset) {
			renderTranslated(context, offset.x, offset.y, function(context) { 
				Camera.transform(context, vec(0, 0), 0, MINIMAP_CELL_SIZE, function(context) {
					renderTranslated(context, 1.5, 1.5, function(context) { 
						MiniMapRenderer.render(context, map);

						players.forEach(function(player) {
							renderTransformed(context, player.mapPos.x, player.mapPos.y, player.rotation, 1, function(context) {
								PlayerRenderer.forMinimap(context, player.style);
							});
						});
					});
				});
			});
		}
	};
})();