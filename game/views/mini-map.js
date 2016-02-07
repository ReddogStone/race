var MiniMapView = function(map, visibleSize) {
	visibleSize = visibleSize || 1000;

	var PIVOT = vec(0.5, 0);

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
			var pivot = vmul(vec(buffer.width, buffer.height), PIVOT);

			renderPivotTransformed(context, offset.x, offset.y, 0, 1, pivot.x, pivot.y, function(context) {
				CameraRenderer.transform(context, vec(0, 0), 0, MINIMAP_CELL_SIZE, function(context) {
					var mainPlayerPos = players[players.length - 1].pos;

					context.save();
					context.beginPath();
					context.rect(mainPlayerPos.x + 1.5 - 0.5 * visibleSize, mainPlayerPos.y + 1.5 - 0.5 * visibleSize, visibleSize, visibleSize);
					context.clip();

					var size = vscale(vec(buffer.width, buffer.height), 1 / MINIMAP_CELL_SIZE);
					context.drawImage(buffer, 0, 0, size.x, size.y);

					context.restore();

					renderTranslated(context, 1.5, 1.5, function(context) {
						players.forEach(function(player) {
							renderTransformed(context, player.pos.x, player.pos.y, 0, 1, function(context) {
								PlayerRenderer.forMinimap(context, player.style);
							});
						});
					});
				});
			});
		}
	};
};