var MiniMapView = function(map) {
	var mapSize = MapLogic.getSize(map);

	var buffer = document.createElement('canvas');
	buffer.width = (mapSize.x + 2) * MINIMAP_CELL_SIZE;
	buffer.height = (mapSize.y + 2) * MINIMAP_CELL_SIZE;

	var bufferContext = buffer.getContext('2d');

	CameraRenderer.transform(bufferContext, vec(0, 0), 0, MINIMAP_CELL_SIZE, function(context) {
		renderTranslated(context, 1.5, 1.5, function(context) { 
			MiniMapRenderer.render(context, map);
		});
	});

	return {
		render: function(context, players, offset) {
			renderTranslated(context, offset.x, offset.y, function(context) {
				context.drawImage(buffer, 0, 0);

				CameraRenderer.transform(context, vec(0, 0), 0, MINIMAP_CELL_SIZE, function(context) {
					renderTranslated(context, 1.5, 1.5, function(context) { 
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
};